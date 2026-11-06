import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'small phone', width: 320, height: 568 },
  { name: 'narrow phone', width: 360, height: 740 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'landscape phone', width: 844, height: 390 },
]

const publicRoutes = [
  '/',
  '/about',
  '/events',
  '/devfest',
  '/events/devfest-nairobi-2026',
  '/code-of-conduct',
  '/schedule',
  '/speakers',
  '/venue',
  '/partners',
  '/team',
]

for (const viewport of viewports) {
  test(`${viewport.name} public layouts stay within the viewport`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.setViewportSize(viewport)

    for (const route of publicRoutes) {
      await page.goto(`http://localhost:3000${route}`)
      await expect(page.locator('main#main-content')).toBeVisible()
      await expect(page.locator('h1').first()).toBeVisible()

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      )

      expect(hasHorizontalOverflow, `${route} overflows at ${viewport.width}px`).toBe(false)
      const clipped = await page
        .locator(
          '.schedule-session-card, .schedule-session-card h4, .schedule-session-card small, .schedule-session-card time, [data-programme-controls], [data-programme-controls] button, [data-programme-controls] select, .editorial-list h3, .wide-cta strong, .footer a, .inner-footer a',
        )
        .evaluateAll((elements) =>
          elements.flatMap((element) => {
            const box = element.getBoundingClientRect()
            if (!box.width || !box.height) return []
            return box.left < -1 || box.right > innerWidth + 1
              ? [element.textContent?.trim().slice(0, 80)]
              : []
          }),
        )
      expect(clipped, `${route} clips content at ${viewport.width}px`).toEqual([])
      await expect(page.getByRole('link', { name: /^Register.*DevFest/i })).toHaveCount(0)
    }
  })
}

test('compact navigation opens on touch-sized layouts', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('http://localhost:3000')

  const menu = page.getByRole('button', { name: 'Open menu' })
  await expect(menu).toBeVisible()
  await menu.click()
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
})

test.describe('Touch navigation', () => {
  test.use({ isMobile: true, hasTouch: true })
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    test(`all menu links remain reachable at ${viewport.width}×${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto('http://localhost:3000/about')
      const toggle = page.getByRole('button', { name: 'Open menu' })
      await toggle.tap()
      const nav = page.getByRole('navigation', { name: 'Primary navigation' })
      await expect(nav).toBeVisible()
      const box = await nav.boundingBox()
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height)
      for (const link of await nav.getByRole('link').all()) {
        await link.scrollIntoViewIfNeeded()
        // Scroll positions can leave a fraction of a pixel behind the menu border.
        await expect(link).toBeInViewport({ ratio: 0.99 })
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      }
      await page.keyboard.press('Escape')
      await expect(toggle).toBeFocused()
    })
  }
})
