import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor, publishedOrEditor } from '@/access'

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

export const Speakers: CollectionConfig = {
  slug: 'speakers',
  access: { create: isEditor, delete: isAdmin, read: publishedOrEditor, update: isEditor },
  admin: {
    defaultColumns: ['name', 'company', 'featured', '_status'],
    description: 'Reusable speaker profiles. Updates flow through to every linked event session.',
    useAsTitle: 'name',
  },
  hooks: {
    beforeValidate: [({ data, originalDoc }) => {
      if (data && !data.slug) data.slug = slugify(data.name || originalDoc?.name || '')
      return data
    }],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'isOrganization',
      label: 'This profile represents an organization',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Keep partner attribution in the programme without listing this profile as a person in the speakers section.' },
    },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'importAliases',
      label: 'Other names used in imports',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Schedule imports recognise these names and link to this profile. The main name remains public.',
      },
    },
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
