import { test as base, Page } from '@playwright/test'

type AuthFixtures = {
  authenticatedPage: Page
}

/**
 * Mock user data for E2E tests
 */
export const mockUser = {
  id: 'user-e2e-1',
  email: 'sonia@example.com',
  name: 'Sonia',
  language: 'es',
  currency: 'EUR'
}

/**
 * Sets up authentication mocks for the page
 */
export async function setupAuthMocks(page: Page) {
  // Mock the /api/auth/me endpoint
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: mockUser
      })
    })
  })

  // Mock the /api/auth/login endpoint
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        token: 'fake-jwt-token',
        user: mockUser
      })
    })
  })
}

/**
 * Performs login action
 */
export async function performLogin(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(mockUser.email)
  await page.getByLabel(/contraseñ|password/i).fill('password123')
  await page.getByRole('button', { name: /iniciar sesión|login/i }).click()
}

/**
 * Extended test with authenticated page fixture
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup authentication mocks
    await setupAuthMocks(page)

    const token = 'fake-jwt-token'

    await page.addInitScript(
      ({ initToken, initUser }) => {
        window.localStorage.setItem('token', initToken)
        window.localStorage.setItem('user', JSON.stringify(initUser))
      },
      { initToken: token, initUser: mockUser }
    )

    // Provide the authenticated page to the test
    // eslint-disable-next-line react-hooks/rules-of-hooks -- This is Playwright's fixture API, not a React Hook
    await use(page)
  }
})

export { expect } from '@playwright/test'
