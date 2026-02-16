import { test, expect } from './fixtures/auth.fixture'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Mock the dashboard summary API
    await authenticatedPage.route(
      '**/api/transactions/summary*',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            summary: {
              totalIncome: 5000,
              totalExpenses: 3000,
              balance: 2000,
              byMonth: [
                { month: '2026-01', income: 2000, expenses: 1500 },
                { month: '2026-02', income: 3000, expenses: 1500 }
              ],
              byCategory: [
                { category: 'salary', type: 'income', total: 5000, count: 2 },
                {
                  category: 'groceries',
                  type: 'expense',
                  total: 3000,
                  count: 2
                }
              ]
            }
          })
        })
      }
    )

    // Mock the transactions list API
    await authenticatedPage.route('**/api/transactions*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'txn-1',
              user_id: 'user-e2e-1',
              amount: 1000,
              type: 'income',
              category: 'salary',
              date: '2026-01-01T00:00:00Z',
              description: 'Salary for January',
              createdAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z'
            },
            {
              _id: 'txn-2',
              user_id: 'user-e2e-1',
              amount: 500,
              type: 'expense',
              category: 'groceries',
              date: '2026-01-05T00:00:00Z',
              description: 'Grocery shopping',
              createdAt: '2026-01-05T00:00:00Z',
              updatedAt: '2026-01-05T00:00:00Z'
            }
          ]
        })
      })
    })

    await authenticatedPage.goto('/app/dashboard')
    await authenticatedPage.waitForURL(/\/app\/dashboard/, { timeout: 5000 })
  })

  test('should display dashboard content for authenticated user', async ({
    authenticatedPage
  }) => {
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
