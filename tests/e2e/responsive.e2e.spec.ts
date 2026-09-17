import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'small phone', width: 320, height: 568 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 1000 },
]

for (const viewport of viewports) {
  test(`${viewport.name} layout stays within its viewport`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('http://localhost:3000')

    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Join GDG Nairobi/i }).first()).toBeVisible()

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )

    expect(hasHorizontalOverflow).toBe(false)
  })
}

test('compact navigation opens on touch-sized layouts', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('http://localhost:3000')

  const menu = page.getByRole('button', { name: 'Toggle menu' })
  await expect(menu).toBeVisible()
  await menu.click()
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
})
