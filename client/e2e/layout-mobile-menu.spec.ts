import { test, expect } from './fixtures/auth.fixture'
import type { Page } from '@playwright/test'

async function setupTransactionsMocks(page: Page) {
  await page.route('**/api/transactions*', async (route) => {
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
          }
        ]
      })
    })
  })

  await page.route('**/api/categories*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            _id: 'cat-1',
            name: 'Groceries',
            type: 'expense',
            color: '#f87171',
            icon: 'shopping-cart',
            isDefault: true
          },
          {
            _id: 'cat-2',
            name: 'Salary',
            type: 'income',
            color: '#34d399',
            icon: 'cash',
            isDefault: true
          }
        ]
      })
    })
  })
}

async function openMobileMenu(page: Page) {
  await page.locator('header button.md\\:hidden').click()
  await expect(page.locator('#language')).toBeVisible()
}

test.describe('Layout mobile menu behavior', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 390, height: 844 })
    await setupTransactionsMocks(authenticatedPage)
    await authenticatedPage.goto('/app/transactions')
  })

  test('closes after changing theme', async ({ authenticatedPage }) => {
    await openMobileMenu(authenticatedPage)

    await authenticatedPage
      .getByRole('button', { name: /toggle theme/i })
      .click()

    await expect(authenticatedPage.locator('#language')).toHaveCount(0)
  })

  test('closes after changing language', async ({ authenticatedPage }) => {
    await openMobileMenu(authenticatedPage)

    await authenticatedPage.locator('#language').selectOption('en')

    await expect(authenticatedPage.locator('#language')).toHaveCount(0)
  })

  test('closes after changing currency', async ({ authenticatedPage }) => {
    await openMobileMenu(authenticatedPage)

    await authenticatedPage.locator('#currency').selectOption('USD')

    await expect(authenticatedPage.locator('#language')).toHaveCount(0)
  })
})
