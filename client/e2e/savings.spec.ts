import { test, expect } from './fixtures/auth.fixture'

test.describe('Savings Goals Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Mock savings goals API
    await authenticatedPage.route('**/api/savings*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          goals: [
            {
              id: 'goal-1',
              name: 'Vacaciones',
              targetAmount: 2000.0,
              currentAmount: 500.0,
              category: 'travel',
              deadline: '2026-08-01T00:00:00Z',
              userId: 'user-e2e-1'
            },
            {
              id: 'goal-2',
              name: 'Fondo de emergencia',
              targetAmount: 5000.0,
              currentAmount: 2000.0,
              category: 'emergency',
              deadline: '2026-12-31T00:00:00Z',
              userId: 'user-e2e-1'
            }
          ],
          total: 2
        })
      })
    })
  })

  test('should navigate to savings goals page', async ({
    authenticatedPage
  }) => {
    await authenticatedPage.goto('/app/savings')
    await expect(authenticatedPage).toHaveURL(/\/app\/savings/)
  })

  test('should display savings goals list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/savings')

    // Verify goals are displayed
    await expect(authenticatedPage.getByText(/vacaciones/i)).toBeVisible()
    await expect(
      authenticatedPage.getByText(/fondo de emergencia/i)
    ).toBeVisible()
  })

  test('should display goal progress information', async ({
    authenticatedPage
  }) => {
    await authenticatedPage.goto('/app/savings')

    // Check for target amounts
    await expect(
      authenticatedPage.getByText(/2000|2,000/).first()
    ).toBeVisible()

    // Check for current amounts
    await expect(authenticatedPage.getByText(/500/).first()).toBeVisible()
  })

  test('should show add goal button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/savings')

    // Look for add/new goal button
    const addButton = authenticatedPage.getByRole('button', {
      name: /añadir|nueva|agregar|add|new/i
    })
    await expect(addButton.first()).toBeVisible()
  })

  test('should display progress bars or indicators', async ({
    authenticatedPage
  }) => {
    await authenticatedPage.goto('/app/savings')

    // Progress bars are usually represented with role="progressbar" or specific classes
    // This is a generic check - adjust based on your UI implementation
    const progressElements = authenticatedPage.locator(
      '[role="progressbar"], .progress, .progress-bar'
    )
    await expect(progressElements.first()).toBeVisible()
  })
})
