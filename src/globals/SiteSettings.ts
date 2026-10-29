import type { GlobalConfig } from 'payload'

import { isEditor } from '@/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true, update: isEditor },
  fields: [
    { name: 'seedRevision', type: 'text', admin: { hidden: true } },
    { name: 'siteName', type: 'text', defaultValue: 'GDG Nairobi', required: true },
    { name: 'brandLabel', type: 'text', defaultValue: 'GDG', required: true },
    { name: 'editionLabel', type: 'text', defaultValue: 'Nairobi', required: true },
    {
      name: 'navigation',
      type: 'array',
      maxRows: 8,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'enabled', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'headerCTA',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Join GDG Nairobi', required: true },
        {
          name: 'url',
          type: 'text',
          defaultValue: 'https://gdg.community.dev/gdg-nairobi/',
          required: true,
        },
      ],
    },
    {
      name: 'communityHomepage',
      label: 'Community homepage',
      type: 'group',
      fields: [
        {
          name: 'hero',
          type: 'group',
          fields: [
            { name: 'eyebrow', type: 'text', defaultValue: 'GDG Nairobi · Volunteer-led' },
            { name: 'headline', type: 'text', defaultValue: 'A developer community' },
            { name: 'accentLine', type: 'text', defaultValue: 'for Nairobi.' },
            {
              name: 'description',
              type: 'textarea',
              defaultValue:
                'Meet peers, learn through practical events and share experience around Google technologies and modern software development.',
            },
            { name: 'primaryLabel', type: 'text', defaultValue: 'Join the community' },
            {
              name: 'primaryURL',
              type: 'text',
              defaultValue: 'https://gdg.community.dev/gdg-nairobi/',
            },
            { name: 'secondaryLabel', type: 'text', defaultValue: 'Explore events' },
            { name: 'secondaryURL', type: 'text', defaultValue: '/events' },
            {
              name: 'photos',
              type: 'array',
              dbName: 'community_hero_photos',
              maxRows: 4,
              admin: {
                description:
                  'Order up to four community photos in equal-sized postcards. The first leads the grid. Leave empty to use the four built-in photographs. Use landscape photos with descriptive Media alt text.',
              },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
            { name: 'photoCaption', type: 'text', defaultValue: 'There is a seat for you here.' },
          ],
        },
        {
          name: 'statistics',
          type: 'array',
          dbName: 'community_stats',
          maxRows: 4,
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', required: true },
          ],
        },
        {
          name: 'about',
          type: 'group',
          fields: [
            { name: 'kicker', type: 'text', defaultValue: 'Community, all year round' },
            {
              name: 'heading',
              type: 'textarea',
              defaultValue: 'Year-round events for Nairobi’s developer community.',
            },
            { name: 'description', type: 'textarea' },
            { name: 'welcomeLead', type: 'text' },
            { name: 'welcomeLine', type: 'text', defaultValue: "you're welcome here." },
          ],
        },
        {
          name: 'programmes',
          label: 'What we do',
          type: 'group',
          fields: [
            { name: 'intro', type: 'textarea' },
            {
              name: 'items',
              type: 'array',
              dbName: 'community_programmes',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea', required: true },
              ],
            },
            { name: 'closing', type: 'textarea' },
            { name: 'accessNote', label: 'Free events note', type: 'textarea' },
          ],
        },
        {
          name: 'connection',
          label: 'Connect with the community',
          type: 'group',
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'description', type: 'textarea' },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          name: 'ticker',
          type: 'group',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true },
            {
              name: 'items',
              type: 'array',
              dbName: 'community_ticker',
              fields: [{ name: 'label', type: 'text', required: true }],
            },
          ],
        },
        {
          name: 'eventsEnabled',
          label: 'Show homepage events',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'highlights',
          type: 'group',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true },
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text' },
            { name: 'intro', type: 'textarea' },
          ],
        },
        {
          name: 'pillars',
          type: 'array',
          dbName: 'community_pillars',
          maxRows: 6,
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
            {
              name: 'accent',
              type: 'select',
              options: ['blue', 'red', 'yellow', 'green'],
              required: true,
            },
          ],
        },
        {
          name: 'ecosystem',
          type: 'group',
          fields: [
            { name: 'kicker', type: 'text', defaultValue: 'More than code' },
            {
              name: 'heading',
              type: 'textarea',
              defaultValue: 'Connected to the wider developer community.',
            },
            { name: 'description', type: 'textarea' },
            {
              name: 'items',
              type: 'array',
              dbName: 'ecosystem_items',
              maxRows: 8,
              fields: [{ name: 'label', type: 'text', required: true }],
            },
          ],
        },
        {
          name: 'closing',
          type: 'group',
          fields: [
            { name: 'kicker', type: 'text', defaultValue: 'Open to every experience level' },
            { name: 'heading', type: 'text', defaultValue: 'Join GDG Nairobi.' },
            { name: 'accentLine', type: 'text', defaultValue: 'Start with the next event.' },
            { name: 'primaryLabel', type: 'text', defaultValue: 'Join GDG Nairobi' },
            {
              name: 'primaryURL',
              type: 'text',
              defaultValue: 'https://gdg.community.dev/gdg-nairobi/',
            },
            { name: 'secondaryLabel', type: 'text', defaultValue: 'Meet the organizers' },
            { name: 'secondaryURL', type: 'text', defaultValue: '/about#organizers' },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      maxRows: 8,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'groups',
          type: 'array',
          maxRows: 5,
          fields: [
            { name: 'heading', type: 'text', required: true },
            {
              name: 'links',
              type: 'array',
              maxRows: 8,
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          name: 'note',
          type: 'textarea',
          defaultValue:
            'GDG Nairobi is an independent group. Our activities and the opinions expressed here should not be linked to Google, the corporation.',
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'GDG Nairobi — Learn, connect and build' },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            'A volunteer-led Google Developer Group for Nairobi: events, workshops, community and DevFest.',
        },
      ],
    },
  ],
  versions: { drafts: { autosave: true, schedulePublish: true }, max: 20 },
}
