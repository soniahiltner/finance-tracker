import { test, expect } from './fixtures/auth.fixture'

test.describe('AI Assistant Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    const timestamp = new Date().toISOString()

    await authenticatedPage.route('**/api/ai/welcome', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Hola, soy tu asistente financiero. ¿En que puedo ayudarte?'
        })
      })
    })

    await authenticatedPage.route('**/api/ai/suggestions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          suggestions: ['Resumen mensual', 'Gastos por categoria']
        })
      })
    })

    await authenticatedPage.route('**/api/ai/query', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          query: '¿Cómo esta mi situacion financiera?',
          answer: 'Esta es una respuesta de prueba del asistente AI.',
          timestamp
        })
      })
    })
  })

  test('should navigate to AI assistant page', async ({
    authenticatedPage
  }) => {
    await authenticatedPage.goto('/app/ai-assistant')
    await expect(authenticatedPage).toHaveURL(/\/app\/ai-assistant/)
  })

  test('should display chat interface', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/ai-assistant')

    // Look for input field for messages
    const messageInput = authenticatedPage
      .getByRole('textbox', { name: /mensaje|message|pregunta/i })
      .or(authenticatedPage.getByPlaceholder(/escribe|write|pregunta|ask/i))

    await expect(messageInput.first()).toBeVisible()
  })

  test('should display send button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/ai-assistant')

    // Look for send button
    const sendButton = authenticatedPage.getByRole('button', {
      name: /enviar|send/i
    })
    await expect(sendButton.first()).toBeVisible()
  })

  test('should send message and display response', async ({
    authenticatedPage
  }) => {
    await authenticatedPage.goto('/app/ai-assistant')

    // Find and fill message input
    const messageInput = authenticatedPage
      .getByRole('textbox', { name: /mensaje|message|pregunta/i })
      .or(authenticatedPage.getByPlaceholder(/escribe|write|pregunta|ask/i))

    await messageInput.first().fill('¿Cómo está mi situación financiera?')

    // Click send button
    const sendButton = authenticatedPage.getByRole('button', {
      name: /enviar|send/i
    })
    await sendButton.first().click()

    // Wait for response to appear
    await expect(
      authenticatedPage.getByText(/respuesta de prueba del asistente/i)
    ).toBeVisible({ timeout: 5000 })
  })
})
