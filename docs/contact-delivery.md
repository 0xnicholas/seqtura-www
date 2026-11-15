# Contact lead delivery

`POST /api/contact` validates and de-duplicates a lead, then fans it out to two
providers in parallel. Each channel has a 5 second budget. The endpoint contract
is unchanged: at least one success returns `200 { "ok": true }`; both failures
return `502 { "ok": false, "error": "delivery_failed" }`; `FORM_MODE=test`
returns 200 without delivery; `FORM_MODE=off` returns 503. An unset or invalid
`FORM_MODE` behaves as `off`.

## Provider matrix

| `EMAIL_PROVIDER`    | Behavior                                                                            |
| ------------------- | ----------------------------------------------------------------------------------- |
| `smtp`              | Sends through the configured SMTP host (enterprise mailbox or domestic SMTP relay). |
| `aliyun`, `tencent` | Reports `provider_not_available` until their domestic HTTP API is implemented.      |
| empty               | Reports `not_configured`.                                                           |

Feishu uses `FEISHU_WEBHOOK_URL` and an optional `FEISHU_WEBHOOK_SECRET`. With a
secret, the request body carries a Unix-seconds `timestamp` and
`sign = base64(HMAC-SHA256(key = timestamp + "\n" + secret, data = ""))`.

Only the failure channel, HTTP status, reason and request ID are logged. Lead
fields, message bodies and provider error text never reach stdout/stderr.

## Environment

- Feishu: `FEISHU_WEBHOOK_URL`, `FEISHU_WEBHOOK_SECRET`.
- SMTP: `EMAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`,
  `SMTP_USER`, `SMTP_PASS`.
- Envelope: `CONTACT_TO_EMAIL` (recipient) and `CONTACT_FROM_EMAIL` (verified
  sending domain). The submitter email is used as `reply_to`.
- Mode: `FORM_MODE=live|test|off`. Unset or unrecognized values fail safe to
  `off` (503 with the email fallback), so a production deploy never silently
  drops leads. Preview deployments must set `test` explicitly; production sets
  `live` only after credentials are ready.
- Rate limit: `CONTACT_RATE_LIMIT_MAX`, `CONTACT_RATE_LIMIT_WINDOW_MS`.

No secret belongs in a `PUBLIC_*` variable.

## Rate limiting

The built-in adapter is an in-memory `RateLimiter` for development and tests
(live default: 5 requests per hour per IP; overridable with
`CONTACT_RATE_LIMIT_MAX` / `CONTACT_RATE_LIMIT_WINDOW_MS`). Its counters live in
one server process, so they do not survive restarts or scale across instances.

Production must enforce the same limit in the host WAF or a shared KV store and
keep this adapter only as a local fallback. Do not add a database, CRM or queue
for lead delivery.

## Tests

`tests/contact-delivery.spec.ts` starts real `dist/server/entry.mjs` processes
with live-mode env, a local Feishu HTTP stub and an `smtp-server` sink. It covers
success on either channel, both-channel failure, test mode, the 5/hour 429,
envelope headers, the signed card payload, PII-free logs and the 5 second
timeout. No test contacts the real Feishu or mail services.
