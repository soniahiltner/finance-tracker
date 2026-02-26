# Release Checklist

## 1) Tests y calidad

- Ejecutar unit tests de client y server.
- Ejecutar smoke E2E UI: `cd client && npm run test:e2e:smoke:ui`.
- Ejecutar E2E (Playwright) completo.
- Smoke manual en preprod: login, dashboard, transactions, savings, AI assistant.

## 2) Build y artefactos

- `npm run build` en client y server.
- Revisar warnings del build.
- Validar que el build de client sirve correctamente (vite preview o similar).

## 3) Configuracion y secretos

- `VITE_API_URL` correcto para produccion.
- `SENTRY_DSN` (server) y `VITE_SENTRY_DSN` (client) configurados.
- `JWT_SECRET`, `MONGO_URI`, `ALLOWED_ORIGINS`, mailer y AI provider configurados.
- `NODE_ENV=production`.

## 4) Seguridad

- Rate limits activos en auth y AI.
- CORS restringido a dominios reales.
- Headers de seguridad revisados (CSP/HSTS/Referrer-Policy).

## 5) Observabilidad

- Logs estructurados disponibles en la plataforma.
- Health check `/health` monitorizado (UptimeRobot/BetterUptime).
- Alertas de errores en Sentry habilitadas.

## 6) Datos y backups

- Backup previo al deploy.
- Plan de rollback y restore documentado.

## 7) Post-deploy

- Smoke test en produccion.
- Revisar dashboards de errores y performance.
