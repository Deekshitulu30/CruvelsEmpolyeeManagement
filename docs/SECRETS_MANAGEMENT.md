# Enterprise Secrets Management Architecture — Cruvels EMS

## 1. Why `.env` is Insufficient for Production
While local development uses `.env` files loaded into `process.env`, storing secrets in static configuration files introduces severe vulnerabilities in production:
* **Accidental Git Leakage:** Developers can inadvertently commit `.env` into source control.
* **Process Inspection:** In containerized environments, any process or debugging tool running inside the container can dump `process.env`.
* **Zero Rotation:** Static environment variables require complete process restarts to rotate credentials.
* **No Audit Trail:** Static files provide no access logs showing *who* accessed a secret and *when*.

---

## 2. Production Secrets Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Enterprise Key Management (KMS)            │
│         (AWS Secrets Manager / HashiCorp Vault)         │
└────────────────────────────┬────────────────────────────┘
                             │ Authenticated IAM Role / STS
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Cruvels Node.js Service                 │
│  - Fetches secrets on startup via encrypted TLS         │
│  - Caches in memory with short TTL                      │
│  - Subscribes to secret rotation webhooks               │
└─────────────────────────────────────────────────────────┘
```

### Supported Providers:
1. **AWS Secrets Manager / SSM Parameter Store:**
   * Uses AWS IAM Role-Based Access (no hardcoded API keys).
   * Automatically rotates PostgreSQL database passwords on a 30-day schedule using Lambda.
2. **HashiCorp Vault:**
   * Dynamic short-lived database credentials generated on-demand with automatic lease expiry.
3. **Doppler / Infisical:**
   * Modern developer-friendly secret orchestrators with end-to-end encryption and audit trails.

---

## 3. Secret Rotation Strategy

### JWT Secret Key Rotation (Zero-Downtime Double-Key Pattern)
```javascript
// Active verification accepts current key OR previous key during 24-hour transition window
const verifyTokenWithRotation = (token) => {
    try {
        return jwt.verify(token, CURRENT_JWT_SECRET);
    } catch (err) {
        if (PREVIOUS_JWT_SECRET) {
            return jwt.verify(token, PREVIOUS_JWT_SECRET);
        }
        throw err;
    }
};
```

---

## 4. Operational Checklist Before Production Deployment
- [ ] Ensure `.env` is in `.gitignore` (Verified).
- [ ] Run automated secret scanning via TruffleHog / GitGuardian in CI/CD pipeline (Configured in `.github/workflows/security-audit.yml`).
- [ ] Inject secrets via container orchestration (Kubernetes Secrets / AWS ECS Task Definitions).
- [ ] Enable KMS envelope encryption for sensitive database backups.
