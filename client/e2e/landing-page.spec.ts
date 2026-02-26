import { test, expect } from '@playwright/test'
import { openPageWithLocale } from './fixtures/locale.helpers'

test('landing page shows main CTA', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'FinanceTracker' })
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /iniciar sesión|login/i })
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /crear cuenta|create account/i })
  ).toBeVisible()
})

test('landing page autodetects English from browser locale', async ({
  browser
}) => {
  const { context, page } = await openPageWithLocale(browser, 'en-US')

  try {
    await expect(page.getByText('Manage your finances with AI')).toBeVisible()
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible()
    await expect(
      page.getByRole('link', { name: /create account/i })
    ).toBeVisible()
  } finally {
    await context.close()
  }
})

test('landing page autodetects Spanish from browser locale', async ({
  browser
}) => {
  const { context, page } = await openPageWithLocale(browser, 'es-ES')

  try {
    await expect(
      page.getByText('Gestiona tus finanzas con IA', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /iniciar sesión/i })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /crear cuenta/i })
    ).toBeVisible()
  } finally {
    await context.close()
  }
})
