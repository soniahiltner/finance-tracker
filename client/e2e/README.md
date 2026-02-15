# E2E Testing with Playwright

Este directorio contiene los tests end-to-end (E2E) para la aplicación Finance Tracker.

## Estructura

```
e2e/
├── fixtures/
│   └── auth.fixture.ts          # Fixtures de autenticación reutilizables
├── ai-assistant.spec.ts         # Tests para AI Assistant
├── dashboard.spec.ts            # Tests para Dashboard
├── landing-page.spec.ts         # Tests para Landing Page
├── login.spec.ts                # Tests para Login
├── navigation.spec.ts           # Tests para navegación y redirecciones
├── savings.spec.ts              # Tests para Savings Goals
├── transactions.spec.ts         # Tests para Transactions
└── README.md                    # Este archivo
```

## Fixtures de Autenticación

Las fixtures en `fixtures/auth.fixture.ts` proporcionan utilidades reutilizables para tests que requieren autenticación:

### `setupAuthMocks(page)`

Configura los mocks de las APIs de autenticación (`/api/auth/me` y `/api/auth/login`).

### `performLogin(page)`

Realiza el proceso completo de login (navega a `/login`, completa el formulario, hace clic en submit).

### `mockUser`

Objeto con los datos del usuario de prueba.

### Fixture `authenticatedPage`

Una página de Playwright que ya está autenticada y lista para usar en tests de rutas protegidas.

## Uso de las Fixtures

### Opción 1: Usando helpers individuales

```typescript
import { test, expect } from '@playwright/test'
import { setupAuthMocks, performLogin } from './fixtures/auth.fixture'

test('mi test', async ({ page }) => {
  await setupAuthMocks(page)
  await performLogin(page)

  // Tu código de test aquí
})
```

### Opción 2: Usando la fixture `authenticatedPage`

```typescript
import { test, expect } from './fixtures/auth.fixture'

test('mi test con usuario autenticado', async ({ authenticatedPage }) => {
  // authenticatedPage ya está autenticada y en /app/dashboard
  await authenticatedPage.goto('/app/transactions')

  // Tu código de test aquí
})
```

## Ejecutar los Tests

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar tests en modo UI (interactivo)
npx playwright test --ui

# Ejecutar tests de un archivo específico
npx playwright test e2e/dashboard.spec.ts

# Ejecutar tests en modo headed (ver el navegador)
npx playwright test --headed

# Ejecutar tests en un navegador específico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Ver Reports

Después de ejecutar los tests, puedes ver el reporte HTML:

```bash
npx playwright show-report
```

## Debugging

Para debuggear tests:

```bash
# Abrir el inspector de Playwright
npx playwright test --debug

# Debuggear un test específico
npx playwright test e2e/login.spec.ts --debug
```

## Mejores Prácticas

1. **Usa fixtures para autenticación**: No repitas el código de login en cada test.
2. **Mock las APIs**: Todos los tests mockean las respuestas del servidor para ser independientes del backend.
3. **Selectores resilientes**: Usa `getByRole`, `getByLabel`, `getByText` en lugar de selectores CSS cuando sea posible.
4. **Localización flexible**: Usa regex `/patrón/i` para soportar múltiples idiomas.
5. **Esperas explícitas**: Usa `waitForURL`, `waitFor`, o matchers de Playwright en lugar de delays fijos.

## Agregar Nuevos Tests

1. Crea un nuevo archivo `.spec.ts` en el directorio `e2e/`
2. Importa las fixtures necesarias
3. Mockea las APIs que tu test necesite
4. Escribe tests descriptivos usando `test.describe` y `test`

Ejemplo:

```typescript
import { test, expect } from './fixtures/auth.fixture'

test.describe('Mi Nueva Funcionalidad', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Mock APIs específicas
    await authenticatedPage.route('**/api/mi-endpoint', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: 'test' })
      })
    })
  })

  test('should do something', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/mi-ruta')
    // Assertions...
  })
})
```

## Configuración

La configuración de Playwright se encuentra en `playwright.config.ts` en la raíz del proyecto `client/`.
