# Vameo — Laravel API

Backend API for the Vameo service (events, expenses, balances, settlements). Authentication uses **Laravel Sanctum** (`Authorization: Bearer <token>`).

## Requirements

- PHP 8.2+, Composer
- PostgreSQL, Redis, RabbitMQ (typical stack via Docker Compose)

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

Run tests (SQLite in-memory by default in `phpunit.xml`; full suite may require Redis when testing balance cache):

```bash
php artisan test
```

## Settlement API (settle-up)

All routes below require `auth:sanctum`. Routes under `/api/events/{event_id}/…` also require membership in the event (`event.member` middleware).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/events/{event_id}/settle-up` | Compute minimal transfers from current balances, create `settlements` (pending), invalidate balance cache, enqueue RabbitMQ `settlement_notifications`. |
| `GET` | `/api/events/{event_id}/settlements` | List settlements for the event. |
| `PUT` | `/api/settlements/{id}/pay` | Mark settlement as paid (only the `from_user` / debtor). |
| `POST` | `/api/events/{event_id}/close` | Close event (event **admin** only): balances must be zero and every settlement must be `paid`. |

### `POST /api/events/{event_id}/settle-up` response

JSON includes:

- **`data`** — array of settlement objects (`id`, `from_user`, `to_user`, `amount_cents`, `status`, `created_at`, `paid_at`, …).
- **`transactions`** — same recommended transfers in minimal form: `{ from_user_id, to_user_id, amount_cents }[]` (mirrors `data`, without nested user objects).

Example shape:

```json
{
  "data": [
    {
      "id": "…",
      "from_user": { "id": 2, "name": "…", "email": "…" },
      "to_user": { "id": 1, "name": "…", "email": "…" },
      "amount_cents": 500,
      "status": "pending",
      "created_at": "…",
      "paid_at": null
    }
  ],
  "transactions": [
    { "from_user_id": 2, "to_user_id": 1, "amount_cents": 500 }
  ]
}
```

### Expenses (reminder)

Create expense: body field is **`amount_cents`** (integer), not `amount`.

### Other routes

See `routes/api.php` for auth, events, members, expenses, payments, balances.

## License

Application code follows the project license. Laravel is open-sourced under the [MIT license](https://opensource.org/licenses/MIT).
