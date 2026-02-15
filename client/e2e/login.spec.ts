import { test, expect } from '@playwright/test'
import { setupAuthMocks, performLogin } from './fixtures/auth.fixture'

test('login happy path redirects to dashboard', async ({ page }) => {
  await setupAuthMocks(page)
  await performLogin(page)
  await expect(page).toHaveURL(/\/app\/dashboard/)
})
