import type { Browser, BrowserContext, Page } from '@playwright/test'

export async function openPageWithLocale(
  browser: Browser,
  locale: string,
  url = '/'
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ locale })
  const page = await context.newPage()
  await page.goto(url)

  return { context, page }
}
