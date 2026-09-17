import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor, publishedOrEditor } from '@/access'

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  access: { create: isEditor, delete: isAdmin, read: publishedOrEditor, update: isEditor },
  admin: { defaultColumns: ['title', 'kind', 'startsAt', 'endsAt', '_status'], useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    { name: 'kind', type: 'select', options: ['info', 'cfp', 'tickets', 'urgent'], defaultValue: 'info' },
    { name: 'startsAt', type: 'date' },
    { name: 'endsAt', type: 'date' },
    { name: 'linkLabel', type: 'text' },
    { name: 'linkURL', type: 'text' },
  ],
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 20 },
}
