import { expect, test } from '@playwright/test'

for (const width of [320, 390, 768, 1024, 1025, 1440]) {
  test(`community postcards fit and load at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('http://localhost:3000')
    const hero = page.locator('.community-photo-hero')
    const photos = hero.getByRole('img')
    await expect(photos).toHaveCount(4)
    await expect(photos.first()).toHaveAttribute('src', /community-audience-wide/)
    await expect(hero.getByText('There is a seat for you here.')).toBeVisible()
    await expect(hero.locator('.hero-art, .hero-products')).toHaveCount(0)

    for (const photo of await photos.all()) {
      await photo.scrollIntoViewIfNeeded()
      await expect(photo).toHaveAttribute('alt', /\S/)
      await expect
        .poll(() =>
          photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
        )
        .toBe(true)
      const bounds = await photo.boundingBox()
      expect(bounds).not.toBeNull()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    }

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true)
    const imageWidths = await photos.evaluateAll((images) =>
      images.map((image) => image.clientWidth),
    )
    expect(Math.max(...imageWidths) - Math.min(...imageWidths)).toBeLessThanOrEqual(1)
    const copy = await hero.locator('.hero-copy').boundingBox()
    const firstPhoto = await photos.first().boundingBox()
    if (width > 1024) expect(firstPhoto!.x).toBeGreaterThan(copy!.x + copy!.width)
    else expect(firstPhoto!.y).toBeGreaterThan(copy!.y + copy!.height)

    if (width === 390 || width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({
        path: `/private/tmp/gdg-community-hero-${width === 390 ? 'mobile' : 'desktop'}.png`,
        fullPage: true,
        animations: 'disabled',
        clip: {
          x: 0,
          y: 0,
          width,
          height: await hero.evaluate((section) => section.getBoundingClientRect().height),
        },
      })
    }
  })
}

test('hero actions retain keyboard focus with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('http://localhost:3000')
  const join = page
    .locator('.community-photo-hero')
    .getByRole('link', { name: /Join the community/ })
  for (
    let index = 0;
    index < 20 && !(await join.evaluate((link) => link === document.activeElement));
    index++
  ) {
    await page.keyboard.press('Tab')
  }
  await expect(join).toBeFocused()
  expect(await join.evaluate((link) => getComputedStyle(link).outlineStyle)).toBe('solid')
  await page.keyboard.press('Tab')
  await expect(
    page.locator('.community-photo-hero').getByRole('link', { name: /Explore events/ }),
  ).toBeFocused()
  expect(
    await page
      .locator('.community-photo-hero .motion-layer')
      .evaluate((layer) => getComputedStyle(layer).transform),
  ).toBe('none')
})
