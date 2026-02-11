import { test, expect } from '@playwright/test'

test('landing page shows main CTA', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'FinanceTracker' })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Iniciar/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Crear Cuenta/i })).toBeVisible()
})
