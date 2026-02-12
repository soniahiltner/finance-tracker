import { test, expect } from '@playwright/test'

test('login happy path redirects to dashboard', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        token: 'fake-jwt-token',
        user: {
          id: 'user-e2e-1',
          email: 'sonia@example.com',
          name: 'Sonia'
        }
      })
    })
  })

  await page.goto('/login')

  await page.getByLabel(/email/i).fill('sonia@example.com')
  await page.getByLabel(/contraseñ|password/i).fill('password123')
  await page.getByRole('button', { name: /iniciar sesión|login/i }).click()

  await expect(page).toHaveURL(/\/app\/dashboard/)
})
