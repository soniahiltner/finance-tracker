import { test, expect } from './fixtures/auth.fixture'

test.describe('Savings Goals Page', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Mock savings goals stats API - must be first since it's more specific
    await authenticatedPage.route(
      '**/api/savings-goals/stats',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            stats: {
              total: 2,
              active: 2,
              completed: 0,
              totalTarget: 7000,
              totalSaved: 2500,
              averageProgress: 35.71
            }
          })
        })
      }
    )

    // Mock savings goals list API - must be after stats to not override it
    await authenticatedPage.route('**/api/savings-goals*', async (route) => {
      const url = route.request().url()

      // Skip if it's the stats endpoint
      if (url.includes('/stats')) {
        return route.continue()
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'goal-1',
              name: 'Vacaciones',
              targetAmount: 2000.0,
              currentAmount: 500.0,
              category: 'travel',
              deadline: '2026-08-01T00:00:00Z',
              userId: 'user-e2e-1',
              isCompleted: false,
              color: '#3b82f6',
              icon: 'plane',
              progress: 25.0, // currentAmount / targetAmount * 100
              daysRemaining: 166, // Days until 2026-08-01
              createdAt: '2026-02-01T00:00:00Z',
              updatedAt: '2026-02-15T00:00:00Z'
            },
            {
              _id: 'goal-2',
              name: 'Fondo de emergencia',
              targetAmount: 5000.0,
              currentAmount: 2000.0,
              category: 'emergency',
              deadline: '2026-12-31T00:00:00Z',
              userId: 'user-e2e-1',
              isCompleted: false,
              color: '#ef4444',
              icon: 'shield',
              progress: 40.0, // currentAmount / targetAmount * 100
              daysRemaining: 318, // Days until 2026-12-31
              createdAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-02-10T00:00:00Z'
            }
          ]
        })
      })
    })
  })

  test('should navigate to savings goals page', async ({
    authenticatedPage
  }) => {
    await authenticatedPage.goto('/app/savings-goals')
    await expect(authenticatedPage).toHaveURL(/\/app\/savings-goals/)
  })

  test('should display savings goals list', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/savings-goals')

    // Wait for page to load
    await authenticatedPage.waitForLoadState('networkidle')

    // Verify goals are displayed
    await expect(authenticatedPage.getByText(/vacaciones/i)).toBeVisible()
    await expect(
      authenticatedPage.getByText(/fondo de emergencia/i)
    ).toBeVisible()
  })

  test('should display goal progress information', async ({
    authenticatedPage
  }) => {
    await authenticatedPage.goto('/app/savings-goals')

    // Check for target amounts
    await expect(
      authenticatedPage.getByText(/2000|2,000/).first()
    ).toBeVisible()

    // Check for current amounts
    await expect(authenticatedPage.getByText(/500/).first()).toBeVisible()
  })

  test('should show add goal button', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/savings-goals')

    // Look for add/new goal button
    const addButton = authenticatedPage.getByRole('button', {
      name: /añadir|nueva|agregar|add|new/i
    })
    await expect(addButton.first()).toBeVisible()
  })

  test('should display progress bars or indicators', async ({
    authenticatedPage
  }) => {
    await authenticatedPage.goto('/app/savings-goals')

    // Progress bars are usually represented with role="progressbar" or specific classes
    // This is a generic check - adjust based on your UI implementation
    const progressElements = authenticatedPage.locator(
      '[role="progressbar"], .progress, .progress-bar'
    )
    await expect(progressElements.first()).toBeVisible()
  })
})
