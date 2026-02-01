# Guía de Testing - Password Reset

## Descripción General

Se han agregado tests completos para la funcionalidad de recuperación y reseteo de contraseña usando:

- **Backend**: Jest + Supertest
- **Frontend**: Vitest + React Testing Library

## Tests del Servidor

### Archivo: `server/src/__tests__/passwordReset.test.ts`

**14 Tests Implementados:**

#### POST `/api/auth/forgot-password`

1. ✓ Enviar email de reset para usuario existente
2. ✓ Retornar 200 incluso si el email no existe (medida de seguridad)
3. ✓ Retornar 400 si el email está faltante
4. ✓ Retornar 400 para formato de email inválido
5. ✓ Generar token válido que expire en 1 hora

#### POST `/api/auth/reset-password`

6. ✓ Resetear contraseña exitosamente con token válido
7. ✓ Retornar 400 con token expirado
8. ✓ Retornar 400 con token inválido
9. ✓ Retornar 400 si contraseña es muy débil
10. ✓ Retornar 400 si token está faltante
11. ✓ Retornar 400 si newPassword está faltante
12. ✓ No resetear contraseña para usuario sin token
13. ✓ Manejar case sensitivity del token correctamente

#### Integration Tests

14. ✓ Flujo completo forgot-password → reset-password

### Ejecución

```bash
cd server
npm test -- passwordReset.test.ts
```

## Tests del Cliente

### Archivo: `client/src/services/authService.test.ts`

**Tests del Servicio:**

- ✓ Llamar endpoint forgot-password con email
- ✓ Manejar errores de API
- ✓ Validar errores de validación
- ✓ Llamar endpoint reset-password con token y contraseña
- ✓ Manejar errores de token inválido
- ✓ Manejar errores de contraseña débil
- ✓ Manejar timeouts de conexión

### Archivo: `client/src/pages/PasswordReset.test.tsx`

**ForgotPasswordPage (7 tests):**

- ✓ Renderizar formulario
- ✓ Llamar servicio al submitir
- ✓ Mostrar mensaje de éxito
- ✓ Mostrar mensaje de error
- ✓ Validar email requerido
- ✓ Link de regreso al login
- ✓ Manejo de errores de API

**ResetPasswordPage (9 tests):**

- ✓ Renderizar formulario
- ✓ Llamar servicio al submitir
- ✓ Validar que contraseñas coincidan
- ✓ Validar contraseña mínimo 6 caracteres
- ✓ Mostrar error si token es inválido/expirado
- ✓ Mostrar mensaje de éxito
- ✓ Link de regreso al login
- ✓ Deshabilitar botón mientras se envía
- ✓ Token extraído de query param

### Ejecución

```bash
cd client
npm test
```

## Cobertura de Casos

### Seguridad

- ✓ Token con expiración (1 hora)
- ✓ Hash del token antes de guardar en BD
- ✓ No revelar si el email existe (mismo 200 en ambos casos)
- ✓ Token único generado con crypto.randomBytes(32)
- ✓ Limpieza de token después del reset exitoso

### Validación

- ✓ Email válido requerido
- ✓ Contraseña mínimo 6 caracteres
- ✓ Contraseñas deben coincidir (frontend)
- ✓ Token presente y válido

### Errores

- ✓ Campos faltantes
- ✓ Token expirado
- ✓ Token inválido
- ✓ Errores de API/Red

### Flujos Completos

- ✓ forgot-password → reset-password exitoso
- ✓ Contraseña se puede usar para login después del reset

## Mocking

### Backend

- Email service mockeado para tests (no envía emails reales)
- MongoDB en memoria con MongoMemoryServer
- Variables de entorno configuradas para tests

### Frontend

- Servicio de auth mockeado
- React Router mocked (useSearchParams)
- API mockeado para respuestas controladas

## Diferencias entre Ambientes

### Testing

- Mailtrap/Email: Mockeado (no envía)
- BD: MongoDB en memoria
- Tokens: Generados en tests
- Respuestas: Controladas por mocks

### Desarrollo

- Mailtrap: Real (credenciales en .env)
- BD: MongoDB local
- Tokens: Generados por crypto.randomBytes
- Respuestas: Del servidor real

### Producción

- Mailtrap: Real (credenciales en variables)
- BD: MongoDB Atlas
- Tokens: Generados por crypto.randomBytes
- Respuestas: Del servidor en producción

## Cómo Agregar Nuevos Tests

### Backend

```typescript
it('should [expectation]', async () => {
  const response = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: 'test@example.com' })
    .expect(200)

  expect(response.body.success).toBe(true)
})
```

### Frontend

```typescript
it('should [expectation]', async () => {
  renderWithRouter(<ForgotPasswordPage />)

  const input = screen.getByPlaceholderText('tu@email.com')
  fireEvent.change(input, { target: { value: 'test@example.com' } })
  fireEvent.click(screen.getByRole('button'))

  await waitFor(() => {
    expect(mockFunction).toHaveBeenCalled()
  })
})
```

## Resultados Actuales

**Backend:**

- Test Suites: 1 passed
- Tests: 14 passed
- Time: ~2.7s

**Frontend:**

- Archivos creados, listos para ejecución
- 16 tests definidos en total
- Requiere configuración de vitest/testing-library

## Próximos Pasos (Opcional)

1. E2E tests con Cypress/Playwright
2. Tests de performance
3. Seguridad: Pruebas de brute force
4. Cobertura de linea/rama al 100%
