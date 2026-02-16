import { test, expect } from '@playwright/test'

test.describe('Navigation and Authentication Flow', () => {
  const safeGoto = async (
    page: import('@playwright/test').Page,
    url: string
  ) => {
    try {
      await page.goto(url)
    } catch (error) {
      const message = String(error)
      if (!message.includes('ERR_ABORTED')) {
        throw error
      }
      // Ignore aborted navigation when the app triggers a full redirect to /login.
    }
  }

  test('should redirect unauthenticated user to login', async ({ page }) => {
    // Try to access protected route without auth
    await safeGoto(page, '/app/dashboard')

    // Should redirect to login or show login page
    await expect(page).toHaveURL(/\/(login|$)/)
  })

  test('should redirect unauthenticated user from transactions page', async ({
    page
  }) => {
    await safeGoto(page, '/app/transactions')
    await expect(page).toHaveURL(/\/(login|$)/)
  })

  test('should redirect unauthenticated user from savings page', async ({
    page
  }) => {
    await safeGoto(page, '/app/savings')
    await expect(page).toHaveURL(/\/(login|$)/)
  })

  test('should allow access to landing page', async ({ page }) => {
    await page.goto('/')

    // Landing page should load
    await expect(page).toHaveURL(/\/$/)

    // Should have login and register links
    const loginLink = page.getByRole('link', { name: /iniciar sesión|login/i })
    const registerLink = page.getByRole('link', { name: /registr|sign up/i })

    await expect(loginLink.or(registerLink)).toBeVisible()
  })

  test('should navigate to register page from landing', async ({ page }) => {
    await page.goto('/')

    // Click register link
    const registerLink = page.getByRole('link', {
      name: /crear cuenta|create account/i
    })
    await registerLink.first().click()

    await expect(page).toHaveURL(/\/register/)
  })

  test('should navigate to login page from landing', async ({ page }) => {
    await page.goto('/')

    // Click login link
    const loginLink = page.getByRole('link', { name: /iniciar sesión|login/i })
    await loginLink.first().click()

    await expect(page).toHaveURL(/\/login/)
  })
})
