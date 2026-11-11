import { expect, test } from '@playwright/test'

const url = 'http://localhost:3000/events/devfest-nairobi-2026'

test('the rewind drifts, pauses on hover and in its photo popup, then resumes', async ({
  page,
}) => {
  await page.goto(url)
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  const section = page.locator('[data-photo-rewind]')
  await section.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(
    section.getByRole('button', { name: 'Pause automatic photo scrolling' }),
  ).toBeVisible()
  const track = section.locator('[data-film-track]')
  await track.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(track).toBeInViewport({ ratio: 0.9 })
  await page.mouse.move(0, 0)
  const initial = await track.evaluate((el) => el.scrollLeft)
  await expect
    .poll(() => track.evaluate((el) => el.scrollLeft), {
      message: 'The visible film drifts automatically',
    })
    .toBeGreaterThan(initial + 10)
  const photo = section.getByRole('button', {
    name: 'Enlarge photo: Ideas on the main stage',
    exact: true,
  })
  await photo.hover()
  expect(await track.evaluate((el) => el.matches(':hover'))).toBe(true)
  const hovered = await track.evaluate((el) => el.scrollLeft)
  await page.waitForTimeout(350)
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(hovered)
  await photo.click()
  const dialog = page.getByRole('dialog', { name: 'DevFest Nairobi · 2025' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('img')).toHaveAttribute('alt', /Five panellists/)
  const openPosition = await track.evaluate((el) => el.scrollLeft)
  await dialog.getByRole('button', { name: 'Next enlarged photo' }).click()
  await expect(dialog.getByRole('img')).toHaveAttribute('alt', /lectern/)
  await page.keyboard.press('ArrowLeft')
  await expect(dialog.getByRole('img')).toHaveAttribute('alt', /Five panellists/)
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(openPosition)
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(photo).toBeFocused()
  await section.getByRole('heading').click()
  await page.mouse.move(0, 0)
  await expect
    .poll(() => track.evaluate((el) => el.scrollLeft), {
      message: 'The film resumes after the popup closes and the pointer leaves',
    })
    .toBeGreaterThan(openPosition + 10)
  const pause = section.getByRole('button', { name: 'Pause automatic photo scrolling' })
  await pause.click()
  await page.mouse.move(0, 0)
  const paused = await track.evaluate((el) => el.scrollLeft)
  await page.waitForTimeout(350)
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(paused)
  await expect(
    section.getByRole('button', { name: 'Resume automatic photo scrolling' }),
  ).toHaveAttribute('aria-pressed', 'true')

  // The repeated frames must return focus to an accessible, visible original.
  await track.evaluate((el) => {
    el.scrollLeft = el.querySelector<HTMLElement>('[data-repeat]')!.offsetLeft
  })
  await section.locator('[data-repeat] button').first().click()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Close photo preview' }).click()
  const original = section.getByRole('button', {
    name: 'Enlarge photo: A room ready to learn',
    exact: true,
  })
  await expect(original).toBeFocused()
  await expect(original).toBeInViewport({ ratio: 0.9 })
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`reduced-motion photos and popup remain usable at ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width, height: 844 })
    await page.goto(url)
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    const section = page.locator('[data-photo-rewind]')
    await section.scrollIntoViewIfNeeded()
    await expect(
      section.getByRole('button', { name: 'Pause automatic photo scrolling' }),
    ).toHaveCount(0)
    const track = section.locator('[data-film-track]')
    const start = await track.evaluate((el) => el.scrollLeft)
    await page.waitForTimeout(250)
    expect(await track.evaluate((el) => el.scrollLeft)).toBe(start)
    await section.getByRole('button', { name: 'Next photo in strip' }).click()
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(start)
    const photo = section.getByRole('button', {
      name: 'Enlarge photo: Ideas on the main stage',
      exact: true,
    })
    await photo.click()
    const dialog = page.getByRole('dialog', { name: 'DevFest Nairobi · 2025' })
    await expect(dialog.getByRole('img')).toBeVisible()
    const bounds = await dialog.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    const buttons = await dialog.getByRole('button').all()
    for (const button of buttons) {
      const box = await button.boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
    await dialog.getByRole('button', { name: 'Close photo preview' }).click()
    await expect(photo).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
  })
}
