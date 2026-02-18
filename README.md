# Finance Tracker

[![Client Smoke Tests](https://github.com/soniahiltner/finance-tracker/actions/workflows/client-smoke.yml/badge.svg)](https://github.com/soniahiltner/finance-tracker/actions/workflows/client-smoke.yml)

## Quick Links

- [Cliente](client/README.md)
- [Servidor](server/README.md)
- [Docs](DOCS_INDEX.md)

Aplicación de gestión financiera con frontend en React + Vite y backend en Node.js/TypeScript.

## Requisitos

- Node.js 20+
- npm 10+

## Estructura

- `client/`: aplicación web (React, Vitest, Playwright)
- `server/`: API backend (Node.js, TypeScript, Jest)
- `DOCS_INDEX.md`: índice de documentación técnica

## Inicio rápido

### 1) Frontend

```bash
cd client
npm ci
npm run dev
```

### 2) Backend

```bash
cd server
npm ci
npm run dev
```

## Tests clave

### Cliente

```bash
cd client
npm run test:smoke
```

Incluye:

- test de integración de login (Vitest)
- e2e login happy path en Chromium, Firefox y WebKit (Playwright)

### Servidor

```bash
cd server
npm test
```

## Documentación

- [Índice general de docs](DOCS_INDEX.md)
- [Guía de testing](TESTING_GUIDE.md)
- [Setup de entorno](ENV_SETUP.md)
- [README del cliente](client/README.md)
- [README del servidor](server/README.md)

## Deploy en Render

- Configuración de variables: [ENV_SETUP.md](ENV_SETUP.md)


[Live site]:(https://finance-tracker-client-6p02.onrender.com/)
