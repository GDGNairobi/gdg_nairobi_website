import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor, publishedOrEditor } from '@/access'

export const Speakers: CollectionConfig = {
  slug: 'speakers',
  access: { create: isEditor, delete: isAdmin, read: publishedOrEditor, update: isEditor },
  admin: { defaultColumns: ['name', 'company', 'featured', '_status'], useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    { name: 'jobTitle', type: 'text' },
    { name: 'company', type: 'text' },
    { name: 'bio', type: 'richText' },
    { name: 'topics', type: 'text', hasMany: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'links',
      type: 'array',
      maxRows: 5,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 20 },
}
