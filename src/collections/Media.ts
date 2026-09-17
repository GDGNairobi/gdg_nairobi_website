import type { CollectionConfig } from 'payload'

import { isEditor } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: isEditor,
    delete: isEditor,
    read: () => true,
    update: isEditor,
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'credit',
      type: 'text',
      admin: {
        description: 'Photographer, illustrator, or source credit when required.',
      },
    },
  ],
  upload: {
    focalPoint: true,
    imageSizes: [
      { name: 'card', width: 720, height: 480, position: 'centre' },
      { name: 'portrait', width: 640, height: 800, position: 'centre' },
    ],
  },
}
