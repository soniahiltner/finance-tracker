import { test, expect } from './fixtures/auth.fixture'

test.describe('Transactions Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Mock transactions API
    await authenticatedPage.route('**/api/transactions*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'tx-1',
              amount: 50.0,
              description: 'Compra supermercado',
              category: 'groceries',
              type: 'expense',
              date: '2026-02-15T10:00:00Z',
              createdAt: '2026-02-15T10:00:00Z',
              updatedAt: '2026-02-15T10:00:00Z',
              userId: 'user-e2e-1'
            },
            {
              _id: 'tx-2',
              amount: 1500.0,
              description: 'Salario',
              category: 'salary',
              type: 'income',
              date: '2026-02-01T10:00:00Z',
              createdAt: '2026-02-01T10:00:00Z',
              updatedAt: '2026-02-01T10:00:00Z',
              userId: 'user-e2e-1'
            }
          ]
        })
      })
    })

    //Mock categories API
    await authenticatedPage.route('**/api/categories*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { _id: 'cat-1', name: 'Groceries', type: 'expense', color: '#f87171', icon: 'shopping-cart', isDefault: true },
            { _id: 'cat-2', name: 'Salary', type: 'income', color: '#34d399', icon: 'cash', isDefault: true }
          ]
        })
      })
    })
  })

  test('should navigate to transactions page', async ({
    authenticatedPage
  }) => {
    await authenticatedPage.goto('/app/transactions')
    await expect(authenticatedPage).toHaveURL(/\/app\/transactions/)
  })

  test('should display transactions list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/transactions')

    // Verify transactions are displayed
    await expect(
      authenticatedPage.getByText(/compra supermercado/i)
    ).toBeVisible()
    await expect(authenticatedPage.getByText(/salario/i)).toBeVisible()
  })

  test('should display transaction amounts', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/transactions')

    // Check for amounts (may be formatted with currency)
    await expect(authenticatedPage.getByText(/50/).first()).toBeVisible()
    await expect(
      authenticatedPage.getByText(/1500|1,500/).first()
    ).toBeVisible()
  })

  test('should show add transaction button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/transactions')

    // Look for add/new transaction button
    const addButton = authenticatedPage.getByRole('button', {
      name: /añadir|nueva|agregar|add|new/i
    })
    await expect(addButton.first()).toBeVisible()
  })
})
