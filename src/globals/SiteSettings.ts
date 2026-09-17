import type { GlobalConfig } from 'payload'

import { isEditor } from '@/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true, update: isEditor },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'DevFest Nairobi', required: true },
    { name: 'brandLabel', type: 'text', defaultValue: 'DevFest', required: true },
    { name: 'editionLabel', type: 'text', defaultValue: 'Nairobi 2026', required: true },
    { name: 'currentEdition', type: 'relationship', relationTo: 'devfest-editions' },
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
        { name: 'url', type: 'text', defaultValue: 'https://gdg.community.dev/gdg-nairobi/', required: true },
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
        { name: 'note', type: 'textarea', defaultValue: 'Made by the community, for the community. GDG Nairobi is an independent group.' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'DevFest Nairobi 2026 — The Future Grows Here' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
  versions: { drafts: { autosave: true, schedulePublish: true }, max: 20 },
}
