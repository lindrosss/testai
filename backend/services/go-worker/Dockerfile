FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

# Сначала go.mod + исходники с импортами — tidy генерирует полный go.sum (см. .dockerignore для go.sum)
COPY go.mod ./
COPY cmd/worker ./cmd/worker

RUN go mod tidy && go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o worker ./cmd/worker

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/worker .

EXPOSE 8080

CMD ["./worker"]
