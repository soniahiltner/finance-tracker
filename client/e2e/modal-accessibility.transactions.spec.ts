import { test, expect } from './fixtures/auth.fixture'
import type { Page } from '@playwright/test'
import {
  getActiveDialog,
  getCategoryManagementButton,
  getConfirmDialog,
  getDeleteButtonInCard,
  getExportButton,
  getImportButton,
  getModalBackdrop,
  getTransactionOpenButton,
  isFocusInsideActiveDialog,
  isFocusInsideConfirmDialog
} from './fixtures/modal.helpers'

async function setupTransactionsMocks(authenticatedPage: Page) {
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
          }
        ]
      })
    })
  })

  await authenticatedPage.route('**/api/categories*', async (route) => {
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

test.describe('Modal accessibility - Transactions', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await setupTransactionsMocks(authenticatedPage)
    await authenticatedPage.goto('/app/transactions')
  })

  test('traps focus and closes with Escape in transaction modal', async ({
    authenticatedPage
  }) => {
    await getTransactionOpenButton(authenticatedPage).click()

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()

    for (let i = 0; i < 20; i += 1) {
      await authenticatedPage.keyboard.press('Tab')
      const isFocusInside = await isFocusInsideActiveDialog(authenticatedPage)
      expect(isFocusInside).toBe(true)
    }

    for (let i = 0; i < 10; i += 1) {
      await authenticatedPage.keyboard.press('Shift+Tab')
      const isFocusInside = await isFocusInsideActiveDialog(authenticatedPage)
      expect(isFocusInside).toBe(true)
    }

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('closes with backdrop click in transaction modal', async ({
    authenticatedPage
  }) => {
    await getTransactionOpenButton(authenticatedPage).click()

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()

    const backdrop = getModalBackdrop(authenticatedPage)

    await backdrop.click({ position: { x: 5, y: 5 } })
    await expect(dialog).toBeHidden()
  })

  test('restores focus to trigger after closing transaction modal', async ({
    authenticatedPage
  }) => {
    const openButton = getTransactionOpenButton(authenticatedPage)

    await openButton.focus()
    await authenticatedPage.keyboard.press('Enter')

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(openButton).toBeFocused()
  })

  test('opens file chooser with keyboard in import modal', async ({
    authenticatedPage
  }) => {
    await getImportButton(authenticatedPage).click()

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()

    const selectFileLabel = authenticatedPage.locator(
      'label[for="file-upload"]'
    )
    await expect(selectFileLabel).toBeVisible()

    const fileChooserPromise = authenticatedPage.waitForEvent('filechooser')
    await selectFileLabel.focus()
    await authenticatedPage.keyboard.press('Enter')
    await fileChooserPromise
  })

  test('restores focus to import trigger after closing import modal with Escape', async ({
    authenticatedPage
  }) => {
    const importButton = getImportButton(authenticatedPage)

    await importButton.focus()
    await authenticatedPage.keyboard.press('Enter')

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(importButton).toBeFocused()
  })

  test('closes export menu with Escape and restores focus to trigger', async ({
    authenticatedPage
  }) => {
    const exportButton = getExportButton(authenticatedPage)

    await exportButton.focus()
    await authenticatedPage.keyboard.press('Enter')

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(exportButton).toBeFocused()
  })

  test('traps focus in export menu with Tab and Shift+Tab', async ({
    authenticatedPage
  }) => {
    const exportButton = getExportButton(authenticatedPage)

    await exportButton.focus()
    await authenticatedPage.keyboard.press('Enter')

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()
    await expect(authenticatedPage.getByText(/exportar a csv/i)).toBeVisible()

    for (let i = 0; i < 10; i += 1) {
      await authenticatedPage.keyboard.press('Tab')
      const isFocusInside = await isFocusInsideActiveDialog(authenticatedPage)
      expect(isFocusInside).toBe(true)
    }

    for (let i = 0; i < 6; i += 1) {
      await authenticatedPage.keyboard.press('Shift+Tab')
      const isFocusInside = await isFocusInsideActiveDialog(authenticatedPage)
      expect(isFocusInside).toBe(true)
    }

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(exportButton).toBeFocused()
  })

  test('closes category management modal with Escape and restores focus to trigger', async ({
    authenticatedPage
  }) => {
    const categoriesButton = getCategoryManagementButton(authenticatedPage)

    await categoriesButton.focus()
    await authenticatedPage.keyboard.press('Enter')

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()
    await expect(
      authenticatedPage.getByRole('heading', {
        name: /gestionar categorías/i
      })
    ).toBeVisible()

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(categoriesButton).toBeFocused()
  })

  test('traps focus in category management modal with Tab and Shift+Tab', async ({
    authenticatedPage
  }) => {
    const categoriesButton = getCategoryManagementButton(authenticatedPage)

    await categoriesButton.focus()
    await authenticatedPage.keyboard.press('Enter')

    const dialog = getActiveDialog(authenticatedPage)
    await expect(dialog).toBeVisible()
    await expect(
      authenticatedPage.getByRole('heading', {
        name: /gestionar categorías/i
      })
    ).toBeVisible()

    for (let i = 0; i < 12; i += 1) {
      await authenticatedPage.keyboard.press('Tab')
      const isFocusInside = await isFocusInsideActiveDialog(authenticatedPage)
      expect(isFocusInside).toBe(true)
    }

    for (let i = 0; i < 8; i += 1) {
      await authenticatedPage.keyboard.press('Shift+Tab')
      const isFocusInside = await isFocusInsideActiveDialog(authenticatedPage)
      expect(isFocusInside).toBe(true)
    }

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(categoriesButton).toBeFocused()
  })

  test('closes transaction delete confirmation with Escape and restores focus', async ({
    authenticatedPage
  }) => {
    const deleteButton = getDeleteButtonInCard(
      authenticatedPage,
      /compra supermercado/i
    )

    await deleteButton.focus()
    await authenticatedPage.keyboard.press('Enter')

    const dialog = getConfirmDialog(authenticatedPage)
    await expect(dialog).toBeVisible()
    await expect(
      authenticatedPage.getByRole('heading', {
        name: /eliminar transacción/i
      })
    ).toBeVisible()

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(deleteButton).toBeFocused()
  })

  test('traps focus in transaction delete confirmation modal', async ({
    authenticatedPage
  }) => {
    const deleteButton = getDeleteButtonInCard(
      authenticatedPage,
      /compra supermercado/i
    )

    await deleteButton.focus()
    await authenticatedPage.keyboard.press('Enter')

    const dialog = getConfirmDialog(authenticatedPage)
    await expect(dialog).toBeVisible()

    for (let i = 0; i < 8; i += 1) {
      await authenticatedPage.keyboard.press('Tab')
      const isFocusInside = await isFocusInsideConfirmDialog(authenticatedPage)
      expect(isFocusInside).toBe(true)
    }

    for (let i = 0; i < 6; i += 1) {
      await authenticatedPage.keyboard.press('Shift+Tab')
      const isFocusInside = await isFocusInsideConfirmDialog(authenticatedPage)
      expect(isFocusInside).toBe(true)
    }

    await authenticatedPage.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(deleteButton).toBeFocused()
  })
})
