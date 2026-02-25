import type { Page } from '@playwright/test'

export const transactionTriggerName = /nueva transacción|new transaction|nueva/i
export const savingsTriggerName =
  /nueva meta|new savings goal|create new goal|crear/i
export const importTriggerName = /importar|import/i
export const exportTriggerName = /exportar|export/i

export function getActiveDialog(page: Page) {
  return page.locator('[role="dialog"][aria-modal="true"]').first()
}

export function getConfirmDialog(page: Page) {
  return page.locator('[role="alertdialog"]').first()
}

export async function isFocusInsideActiveDialog(page: Page) {
  return page.evaluate(() => {
    const activeDialog = document.querySelector(
      '[role="dialog"][aria-modal="true"]'
    )
    return !!activeDialog && activeDialog.contains(document.activeElement)
  })
}

export async function isFocusInsideConfirmDialog(page: Page) {
  return page.evaluate(() => {
    const activeDialog = document.querySelector('[role="alertdialog"]')
    return !!activeDialog && activeDialog.contains(document.activeElement)
  })
}

export function getTransactionOpenButton(page: Page) {
  return page.getByRole('button', { name: transactionTriggerName }).first()
}

export function getSavingsOpenButton(page: Page) {
  return page.getByRole('button', { name: savingsTriggerName }).first()
}

export function getImportButton(page: Page) {
  return page.getByRole('button', { name: importTriggerName }).first()
}

export function getExportButton(page: Page) {
  return page.getByRole('button', { name: exportTriggerName }).first()
}

export function getCategoryManagementButton(page: Page) {
  return page
    .getByTitle(/gestionar categorías|manage categories|manage category/i)
    .first()
}

export function getModalBackdrop(page: Page) {
  return page.locator('button[aria-hidden="true"][tabindex="-1"]').first()
}

export function getDeleteButtonInCard(page: Page, cardText: RegExp) {
  return page
    .locator('div')
    .filter({ hasText: cardText })
    .first()
    .getByRole('button', { name: /eliminar|delete/i })
    .first()
}
