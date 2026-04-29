package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

const defaultQueue = "task_queue"

type emailSendEnvelope struct {
	ID         string          `json:"id"`
	Type       string          `json:"type"`
	CreatedAt  string          `json:"created_at"`
	RetryCount int             `json:"retry_count"`
	Payload    json.RawMessage `json:"payload"`
}

type emailPayload struct {
	To       string                 `json:"to"`
	Template string                 `json:"template"`
	Data     map[string]interface{} `json:"data"`
}

var (
	processed = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "worker_emails_processed_total",
		Help: "Emails successfully sent to Laravel",
	})
	failures = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "worker_emails_failed_total",
		Help: "Emails dropped after max retries",
	})
	retries = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "worker_emails_retried_total",
		Help: "Email jobs retried",
	})
)

func init() {
	prometheus.MustRegister(processed, failures, retries)
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)
}

func main() {
	http.Handle("/metrics", promhttp.Handler())
	go func() {
		addr := ":2112"
		if p := os.Getenv("METRICS_ADDR"); p != "" {
			addr = p
		}
		log.Printf("prometheus listening %s", addr)
		if err := http.ListenAndServe(addr, nil); err != nil {
			log.Printf("metrics server: %v", err)
		}
	}()

	url := os.Getenv("RABBITMQ_URL")
	if url == "" {
		url = "amqp://guest:guest@localhost:5672/"
	}
	q := os.Getenv("RABBITMQ_QUEUE")
	if q == "" {
		q = defaultQueue
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigCh
		cancel()
	}()

	if err := run(ctx, url, q); err != nil && err != context.Canceled {
		log.Fatalf("worker error: %v", err)
	}
	log.Println("worker stopped")
}

func run(ctx context.Context, url, queue string) error {
	conn, err := amqp.Dial(url)
	if err != nil {
		return err
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	if _, err := ch.QueueDeclare(queue, true, false, false, false, nil); err != nil {
		return err
	}

	msgs, err := ch.ConsumeWithContext(ctx, queue, "go-worker", false, false, false, false, nil)
	if err != nil {
		return err
	}

	log.Printf("connected to RabbitMQ, queue %q", queue)
	log.Printf("Listening on queue %s", queue)

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case d, ok := <-msgs:
			if !ok {
				return nil
			}
			handleDelivery(ch, queue, d)
		}
	}
}

func handleDelivery(ch *amqp.Channel, queue string, d amqp.Delivery) {
	var env emailSendEnvelope
	if err := json.Unmarshal(d.Body, &env); err != nil {
		log.Printf("invalid JSON: %v", err)
		_ = d.Ack(false)
		return
	}
	if env.Type != "email.send" {
		log.Printf("skip type=%s", env.Type)
		_ = d.Ack(false)
		return
	}

	var inner emailPayload
	if err := json.Unmarshal(env.Payload, &inner); err != nil {
		log.Printf("invalid payload: %v", err)
		_ = d.Ack(false)
		return
	}

	if err := postEmail(inner); err != nil {
		log.Printf("post failed: %v retry_count=%d", err, env.RetryCount)
		if env.RetryCount >= 3 {
			failures.Inc()
			_ = d.Ack(false)
			return
		}
		retries.Inc()
		delays := []time.Duration{30 * time.Second, time.Minute, 5 * time.Minute}
		idx := env.RetryCount
		if idx >= len(delays) {
			idx = len(delays) - 1
		}
		delay := delays[idx]
		time.Sleep(delay)
		env.RetryCount++
		body, err := json.Marshal(env)
		if err != nil {
			log.Printf("marshal retry: %v", err)
			_ = d.Ack(false)
			return
		}
		if err := ch.PublishWithContext(context.Background(), "", queue, false, false, amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "application/json",
			Body:         body,
		}); err != nil {
			log.Printf("republish: %v", err)
		}
		_ = d.Ack(false)
		return
	}

	processed.Inc()
	_ = d.Ack(false)
}

func postEmail(p emailPayload) error {
	api := os.Getenv("LARAVEL_API_URL")
	if api == "" {
		api = "http://localhost/api/internal/email/send"
	}
	key := os.Getenv("INTERNAL_API_KEY")
	if key == "" {
		key = "your-secret-api-key-change-me"
	}

	body, err := json.Marshal(map[string]interface{}{
		"to":       p.To,
		"template": p.Template,
		"data":     p.Data,
	})
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, api, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", key)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("http status %d", resp.StatusCode)
	}
	return nil
}
