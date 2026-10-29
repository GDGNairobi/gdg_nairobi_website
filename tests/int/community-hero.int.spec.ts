import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { findGlobal, getPayload } = vi.hoisted(() => ({ findGlobal: vi.fn(), getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload }))

import { defaultCommunityHomeContent, getHomeContent } from '@/lib/site-content'

describe('Community hero content', () => {
  beforeEach(() => {
    vi.stubEnv('ENABLE_CMS', 'true')
    vi.stubEnv('VERCEL', '')
    getPayload.mockResolvedValue({ findGlobal })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetAllMocks()
  })

  it('uses the four built-in photos without connecting to a disabled CMS', async () => {
    vi.stubEnv('ENABLE_CMS', 'false')
    const home = await getHomeContent()
    expect(home.community.hero.photos).toEqual(defaultCommunityHomeContent.hero.photos)
    expect(home.community.hero.photos).toHaveLength(4)
    expect(getPayload).not.toHaveBeenCalled()
  })

  it('keeps the built-in composition when CMS photos are empty or unavailable', async () => {
    findGlobal.mockResolvedValue({ communityHomepage: { hero: { photos: [] } } })
    expect((await getHomeContent()).community.hero.photos).toEqual(
      defaultCommunityHomeContent.hero.photos,
    )
    getPayload.mockRejectedValue(new Error('CMS unavailable'))
    expect((await getHomeContent()).community.hero.photos).toEqual(
      defaultCommunityHomeContent.hero.photos,
    )
  })

  it('replaces the defaults with published CMS photos in their authored order', async () => {
    findGlobal.mockResolvedValue({
      communityHomepage: {
        hero: {
          photos: [
            {
              image: {
                url: '/api/media/file/panel.jpg',
                alt: 'Developers asking a panel questions.',
              },
            },
            {
              image: {
                url: '/api/media/file/workshop.jpg',
                alt: 'Developers coding together at a workshop.',
              },
            },
          ],
          photoCaption: '  Learn with the community.  ',
        },
      },
    })
    const hero = (await getHomeContent()).community.hero
    expect(hero.photos).toEqual([
      { src: '/api/media/file/panel.jpg', alt: 'Developers asking a panel questions.' },
      { src: '/api/media/file/workshop.jpg', alt: 'Developers coding together at a workshop.' },
    ])
    expect(hero.photoCaption).toBe('Learn with the community.')
    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ draft: false, depth: 2 }))
  })

  it('ignores deleted, unresolved or unlabelled media and falls back when none remain', async () => {
    findGlobal.mockResolvedValue({
      communityHomepage: {
        hero: {
          photos: [{ image: null }, { image: 42 }, { image: { url: '/empty.jpg', alt: ' ' } }],
          photoCaption: ' ',
        },
      },
    })
    const hero = (await getHomeContent()).community.hero
    expect(hero.photos).toEqual(defaultCommunityHomeContent.hero.photos)
    expect(hero.photoCaption).toBe(defaultCommunityHomeContent.hero.photoCaption)
  })
})
