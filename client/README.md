# Finance Tracker Client

[![Client Smoke Tests](https://github.com/soniahiltner/finance-tracker/actions/workflows/client-smoke.yml/badge.svg)](https://github.com/soniahiltner/finance-tracker/actions/workflows/client-smoke.yml)

## Quick Links

- [README raíz](../README.md)
- [Servidor](../server/README.md)
- [Docs](../DOCS_INDEX.md)

Frontend de Finance Tracker construido con React + TypeScript + Vite.

## Requisitos

- Node.js 20+
- npm 10+

## Inicio rápido

```bash
npm ci
npm run dev
```

La app se levanta por defecto en `http://localhost:5173`.

## Scripts principales

- `npm run dev`: iniciar entorno de desarrollo
- `npm run build`: compilar para producción
- `npm run preview`: previsualizar build
- `npm run lint`: ejecutar ESLint
- `npm run test:unit`: ejecutar tests unit/integration con Vitest
- `npm run test:e2e`: ejecutar suite Playwright
- `npm run test:e2e:login`: ejecutar e2e de login en Chromium/Firefox/WebKit
- `npm run test:smoke`: ejecutar smoke completo (Vitest login + e2e login)

## Testing

### Unit / Integration (Vitest)

```bash
npm run test:unit
```

### E2E (Playwright)

```bash
npm run test:e2e
```

Smoke rápido de autenticación:

```bash
npm run test:smoke
```

## Estructura relevante

- `src/pages/`: páginas principales
- `src/components/`: componentes UI y de dominio
- `src/hooks/`: hooks reutilizables
- `src/services/`: capa de acceso API
- `e2e/`: pruebas end-to-end

## Relación con backend

El cliente consume la API definida por el servicio backend en `server/`. La URL base se configura por variables de entorno (por defecto: `http://localhost:5000/api`).

## Documentación

- [README raíz](../README.md)
- [Índice general de docs](../DOCS_INDEX.md)
- [Guía de testing](../TESTING_GUIDE.md)
