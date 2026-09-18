import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/GDG Nairobi/)

    const heading = page.locator('h1').first()

    await expect(heading).toContainText('A developer community')
    await expect(page.getByRole('link', { name: /Join GDG Nairobi/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', 'https://github.com/GDGNairobi/gdg_nairobi_website')
    await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Shop', exact: true })).toHaveAttribute('href', 'https://shop.gdgnairobi.com/')
  })

  test('publishes complete search and sharing metadata', async ({ page }) => {
    await page.goto('http://localhost:3000/about')

    await expect(page).toHaveTitle('About GDG Nairobi | GDG Nairobi')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /volunteer-led GDG Nairobi community/i)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'http://localhost:3000/about')
    const socialImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(socialImage).toBe('http://localhost:3000/social-card')
    expect((await page.request.get(socialImage!)).ok()).toBe(true)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'http://localhost:3000/social-card')
    await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0)
  })
})
