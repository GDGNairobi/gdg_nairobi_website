import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor, sourceFieldsReadOnly } from '@/access'

const sourceFieldAccess = { update: sourceFieldsReadOnly }

export const CommunityEvents: CollectionConfig = {
  slug: 'community-events',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: ({ req }) => req.user ? true : { showOnSite: { equals: true } },
    update: isEditor,
  },
  admin: {
    defaultColumns: ['sourceTitle', 'sourceStartDate', 'upstreamStatus', 'showOnSite', 'featured'],
    description: 'Source facts are synchronized from GDG Nairobi. Editors control how an event appears on this site.',
    useAsTitle: 'sourceTitle',
  },
  fields: [
    { name: 'source', type: 'select', defaultValue: 'bevy', options: ['bevy'], required: true, admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'upstreamURL', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'sourceTitle', type: 'text', required: true, admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'sourceStartDate', type: 'date', required: true, admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'sourceType', type: 'text', admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'registrationURL', type: 'text', admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'imageURL', type: 'text', admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'excerpt', type: 'textarea', admin: { readOnly: true }, access: sourceFieldAccess },
    {
      name: 'upstreamStatus',
      type: 'select',
      options: ['live', 'completed', 'stale'],
      required: true,
      admin: { readOnly: true },
      access: sourceFieldAccess,
    },
    { name: 'lastSyncedAt', type: 'date', required: true, admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'showOnSite', type: 'checkbox', defaultValue: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'localLabel', type: 'text', admin: { description: 'Optional short label such as “Workshop” or “Community day”.' } },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
  ],
}
