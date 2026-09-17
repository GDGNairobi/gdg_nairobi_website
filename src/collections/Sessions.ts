import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor, publishedOrEditor } from '@/access'

export const Sessions: CollectionConfig = {
  slug: 'sessions',
  access: { create: isEditor, delete: isAdmin, read: publishedOrEditor, update: isEditor },
  admin: { defaultColumns: ['title', 'startsAt', 'track', 'room', '_status'], useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'richText' },
    { name: 'speakers', type: 'relationship', relationTo: 'speakers', hasMany: true },
    { name: 'startsAt', type: 'date', required: true },
    { name: 'endsAt', type: 'date', required: true },
    { name: 'room', type: 'text', required: true },
    {
      name: 'track',
      type: 'select',
      options: [
        { label: 'AI', value: 'ai' },
        { label: 'Web & Mobile', value: 'web-mobile' },
        { label: 'Cloud & Firebase', value: 'cloud' },
        { label: 'Open source & Community', value: 'open' },
      ],
      required: true,
    },
    { name: 'format', type: 'select', options: ['talk', 'workshop', 'keynote', 'panel', 'break'], required: true },
    { name: 'level', type: 'select', options: ['all', 'beginner', 'intermediate', 'advanced'], defaultValue: 'all' },
  ],
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 20 },
}
