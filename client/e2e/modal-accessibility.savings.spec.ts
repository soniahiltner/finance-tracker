import { test, expect } from './fixtures/auth.fixture'
import type { Page } from '@playwright/test'
import {
  getActiveDialog,
  getConfirmDialog,
  getDeleteButtonInCard,
  getSavingsOpenButton
} from './fixtures/modal.helpers'

async function setupSavingsMocks(authenticatedPage: Page) {
  await authenticatedPage.route('**/api/savings-goals/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        stats: {
          total: 1,
          active: 1,
          completed: 0,
          totalTarget: 2000,
          totalSaved: 500,
          averageProgress: 25
        }
      })
    })
  })

  await authenticatedPage.route('**/api/savings-goals*', async (route) => {
    const url = route.request().url()
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
            targetAmount: 2000,
            currentAmount: 500,
            category: 'travel',
            deadline: '2026-08-01T00:00:00Z',
            userId: 'user-e2e-1',
            isCompleted: false,
            color: '#3b82f6',
            icon: 'plane',
            progress: 25,
            daysRemaining: 166,
            createdAt: '2026-02-01T00:00:00Z',
            updatedAt: '2026-02-15T00:00:00Z'
          }
        ]
      })
    })
  })
}

test.describe('Modal accessibility - Savings', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await setupSavingsMocks(authenticatedPage)
    await authenticatedPage.goto('/app/savings-goals')
  })

  test('closes with Escape in savings goal modal', async ({
    authenticatedPage
  }) => {
    await getSavingsOpenButton(authenticatedPage).click()

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('restores focus to trigger after closing savings goal modal', async ({
    authenticatedPage
  }) => {
    const openButton = getSavingsOpenButton(authenticatedPage)

    await openButton.focus()
    await authenticatedPage.keyboard.press('Enter')

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(openButton).toBeFocused()
  })

  test('closes savings delete confirmation with Escape and restores focus', async ({
    authenticatedPage
  }) => {
    const deleteButton = getDeleteButtonInCard(authenticatedPage, /vacaciones/i)

    await deleteButton.focus()
    await authenticatedPage.keyboard.press('Enter')

    const dialog = getConfirmDialog(authenticatedPage)
    await expect(dialog).toBeVisible()
    await expect(
      authenticatedPage.getByRole('heading', { name: /eliminar meta/i })
    ).toBeVisible()

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(deleteButton).toBeFocused()
  })
})
