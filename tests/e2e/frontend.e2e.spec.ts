import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/DevFest Nairobi 2026/)

    const heading = page.locator('h1').first()

    await expect(heading).toContainText('The future')
    await expect(page.getByRole('link', { name: /Join GDG Nairobi/i }).first()).toBeVisible()
  })
})
