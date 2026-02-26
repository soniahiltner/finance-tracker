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

## 8) Verificacion rapida (cambios 2026-02)

### Headers y cache (produccion)

- Verificar `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`:

```powershell
$u='https://finance-tracker-client-6p02.onrender.com/'; $r=Invoke-WebRequest -Uri $u -UseBasicParsing; $h=$r.Headers; 'content-security-policy','x-frame-options','referrer-policy','permissions-policy','x-content-type-options' | ForEach-Object { '{0}: {1}' -f $_, ($h[$_] ?? '(missing)') }
```

- Verificar cache largo en assets versionados:

```powershell
$u='https://finance-tracker-client-6p02.onrender.com/assets/index-D430d77h.js'; (Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head).Headers['Cache-Control']
```

### Smoke funcional (transacciones)

- Login con usuario de pruebas.
- Ir a `/app/transactions` y validar:
	- Carga de lista sin errores visibles.
	- Busqueda por descripcion y boton `Clean All`.
	- Apertura/cierre de `New Transaction` e `Import`.
	- Botones de fila `Edit/Delete` con labels contextuales (a11y).

### Performance minima esperada

- Ejecutar un trace rapido de carga en `/app/transactions`.
- Confirmar que no empeora frente a baseline:
	- LCP objetivo: <= 2.8s (sin throttling).
	- CLS objetivo: 0.00.

### Rollback rapido

- Si fallan headers/cache o rompe flujo de transacciones:
	- Revertir el ultimo commit de `render.yaml` y `client/src/pages/TransactionsPage.tsx`.
	- Re-desplegar y repetir verificaciones del bloque 8.
