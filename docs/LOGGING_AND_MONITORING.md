# Enterprise Logging, Centralization & Alerting Strategy

## 1. Structured JSON Logging Architecture
Cruvels EMS utilizes structured JSON logging via [`utils/logger.js`](../utils/logger.js). Every log entry is serialized as a single JSON object containing standardized schema fields:
```json
{
  "timestamp": "2026-08-30T08:30:00.000Z",
  "level": "SECURITY",
  "service": "cruvels-ems",
  "message": "Account locked for 15 minutes due to 5 consecutive failed login attempts",
  "userId": "uuid-...",
  "ipAddress": "192.168.1.50",
  "action": "ACCOUNT_LOCKED"
}
```

---

## 2. Log Rotation Strategy (`logrotate`)
To prevent disk exhaustion on local or cloud VM instances, daily log rotation is enforced:

```ini
# /etc/logrotate.d/cruvels
/var/log/cruvels/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nodejs nodejs
    sharedscripts
    postrotate
        kill -USR1 $(pgrep -f "server.js") 2>/dev/null || true
    endscript
}
```
* Retains 14 days of compressed logs locally before purging.

---

## 3. Centralized Ingestion Pipelines
In production Kubernetes / ECS clusters, stdout is captured by a lightweight daemon:
* **Shipper:** **Vector** or **Fluent Bit** collects stdout streams with zero application overhead.
* **Aggregator:** Dispatches to **AWS CloudWatch Logs**, **Datadog**, or **Grafana Loki**.
* **Alerting Triggers:**
  * Spike in `HTTP 423 (Account Locked)`: Alerts security operations of potential brute-force attacks.
  * Spike in `HTTP 429 (Rate Limit Exceeded)`: Triggers automated IP blacklisting at WAF / Cloudflare edge.
  * Any unhandled `HTTP 500` error: Triggers PagerDuty notification to on-call engineer.
