import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor, publishedOrEditor } from '@/access'

export const Partners: CollectionConfig = {
  slug: 'partners',
  access: { create: isEditor, delete: isAdmin, read: publishedOrEditor, update: isEditor },
  admin: { defaultColumns: ['name', 'tier', 'order', '_status'], useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media', required: true },
    { name: 'url', type: 'text' },
    { name: 'tier', type: 'select', options: ['host', 'platinum', 'gold', 'silver', 'community'], required: true },
    { name: 'order', type: 'number', defaultValue: 0, required: true },
  ],
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 20 },
}
