import { test, expect } from './fixtures/auth.fixture'

test.describe('Dashboard Page', () => {
  test('should display dashboard content for authenticated user', async ({
    authenticatedPage
  }) => {
    // The authenticatedPage fixture already navigates to /app/dashboard
    await expect(authenticatedPage).toHaveURL(/\/app\/dashboard/)

    // Verify dashboard elements are present
    await expect(
      authenticatedPage.getByRole('heading', { name: /dashboard|panel/i })
    ).toBeVisible()
  })

  test('should display user information', async ({ authenticatedPage }) => {
    // Check if user name is displayed somewhere in the dashboard
    await expect(authenticatedPage.getByText(/Sonia/i)).toBeVisible()
  })

  test('should allow navigation to other pages', async ({
    authenticatedPage
  }) => {
    // Verify navigation links are present
    const transactionsLink = authenticatedPage.getByRole('link', {
      name: /transacciones|transactions/i
    })
    const savingsLink = authenticatedPage.getByRole('link', {
      name: /ahorros|savings/i
    })

    await expect(transactionsLink.or(savingsLink)).toBeVisible()
  })
})
