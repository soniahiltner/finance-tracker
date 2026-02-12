# Finance Tracker Server

## Quick Links

- [README raíz](../README.md)
- [Cliente](../client/README.md)
- [Docs](../DOCS_INDEX.md)

Backend API de Finance Tracker construido con Node.js + TypeScript + Express.

## Requisitos

- Node.js 20+
- npm 10+
- MongoDB (local o Atlas)

## Inicio rápido

```bash
npm ci
npm run dev
```

Por defecto, el servidor corre en `http://localhost:5000`.

## Variables de entorno

Configura un archivo `.env` en `server/` con las variables necesarias.

Variables mínimas de desarrollo:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
CLIENT_URL=http://localhost:5173
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass
EMAIL_FROM=Finance Tracker <no-reply@finance-tracker.com>
```

Para detalle completo, revisa [ENV_SETUP.md](../ENV_SETUP.md).

## Scripts principales

- `npm run dev`: iniciar servidor en modo watch (`tsx`)
- `npm run build`: compilar TypeScript a `dist/`
- `npm start`: ejecutar build compilado
- `npm test`: ejecutar tests con Jest
- `npm run test:watch`: tests en modo watch
- `npm run test:coverage`: tests con cobertura
- `npm run clean:categories`: utilidad de limpieza de categorías

## Testing

```bash
npm test
```

Cobertura:

```bash
npm run test:coverage
```

## Estructura relevante

- `src/controllers/`: controladores HTTP
- `src/routes/`: definición de rutas
- `src/services/`: lógica de negocio
- `src/models/`: modelos de datos
- `src/middleware/`: middlewares de Express
- `src/validation/`: validación de payloads
- `src/__tests__/`: pruebas del backend

## Documentación

- [README raíz](../README.md)
- [Índice general de docs](../DOCS_INDEX.md)
- [Guía de testing](../TESTING_GUIDE.md)
- [Setup de entorno](../ENV_SETUP.md)
