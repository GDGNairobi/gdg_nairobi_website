import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/GDG Nairobi/)

    const heading = page.locator('h1').first()

    await expect(heading).toContainText('A developer community')
    await expect(page.getByRole('link', { name: /Join GDG Nairobi/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
      'href',
      'https://github.com/GDGNairobi/gdg_nairobi_website',
    )
    await expect(
      page
        .getByRole('navigation', { name: 'Primary navigation' })
        .getByRole('link', { name: 'Shop', exact: true }),
    ).toHaveAttribute('href', 'https://shop.gdgnairobi.com/')
  })

  test('publishes complete search and sharing metadata', async ({ page }) => {
    await page.goto('http://localhost:3000/about')

    await expect(page).toHaveTitle('About GDG Nairobi | GDG Nairobi')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /volunteer-led GDG Nairobi community/i,
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'http://localhost:3000/about',
    )
    const socialImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(socialImage).toBe('http://localhost:3000/social-card')
    expect((await page.request.get(socialImage!)).ok()).toBe(true)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    )
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      'http://localhost:3000/social-card',
    )
    await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0)

    const origin = new URL(page.url()).origin
    const robots = await page.request.get(`${origin}/robots.txt`)
    expect(robots.ok()).toBe(true)
    const rules = await robots.text()
    expect(rules).toContain(`Host: ${origin}`)
    expect(rules).toContain(`Sitemap: ${origin}/sitemap.xml`)
    expect(rules).toContain('Disallow: /admin/')
    expect(rules).toContain('Disallow: /api/')
  })

  test('publishes the DevFest edition card for Open Graph and Twitter', async ({ page }) => {
    await page.goto('http://localhost:3000/events/devfest-nairobi-2026')
    const image = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(image).toMatch(/^http:\/\/localhost:3000\/social-card\/devfest-nairobi-2026\?v=/)
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', image!)
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      'content',
      /DevFest Nairobi 2026/,
    )
    const response = await page.request.get(image!)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('image/png')
    const png = await response.body()
    expect(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true)
    expect(png.readUInt32BE(16)).toBe(1200)
    expect(png.readUInt32BE(20)).toBe(630)
  })

  test('hides a useful Jenga command palette and Nairobi greeting', async ({ page }) => {
    const consoleMessages: string[] = []
    page.on('console', (message) => consoleMessages.push(message.text()))

    await page.goto('http://localhost:3000')
    await expect
      .poll(() => consoleMessages.some((message) => message.includes('Nairobi is building.')))
      .toBe(true)

    await page.keyboard.type('jenga')
    const palette = page.getByRole('dialog', { name: 'Jenga' })
    await expect(palette).toBeVisible()

    await palette.getByRole('searchbox', { name: 'Search site commands' }).fill('schedule')
    await expect(palette.getByRole('option')).toHaveCount(1)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/events\/devfest-nairobi-2026#programme$/)
  })
})
