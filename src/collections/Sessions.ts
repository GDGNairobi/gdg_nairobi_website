import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor, publishedOrEditor } from '@/access'

export const Sessions: CollectionConfig = {
  slug: 'sessions',
  access: { create: isEditor, delete: isAdmin, read: publishedOrEditor, update: isEditor },
  admin: {
    defaultColumns: ['title', 'event', 'startsAt', 'scheduleTrack', 'sessionStatus', 'room', '_status'],
    description: 'Sessions belong to an internal event schedule. Times are the planned times; use the event delay control to shift the whole live schedule.',
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'richText' },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'community-events',
      filterOptions: { eventDestination: { equals: 'schedule' } },
      admin: { description: 'Leave empty only for the standalone DevFest programme.' },
    },
    { name: 'speakers', type: 'relationship', relationTo: 'speakers', hasMany: true },
    { name: 'startsAt', type: 'date', required: true },
    { name: 'endsAt', type: 'date', required: true },
    { name: 'room', type: 'text', required: true },
    {
      name: 'scheduleTrack',
      label: 'Schedule column / stage',
      type: 'text',
      admin: { description: 'For multi-track events, use any organizer-friendly label such as “Main Stage” or “Workshop Room”.' },
    },
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
    {
      name: 'sessionStatus',
      label: 'Live session status',
      type: 'select',
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Delayed', value: 'delayed' },
        { label: 'Happening now', value: 'live' },
        { label: 'Complete', value: 'complete' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publicNote',
      label: 'Attendee update',
      type: 'text',
      admin: { description: 'Short live note such as “Moved to Room B” or “Starting in 10 minutes”.', position: 'sidebar' },
    },
  ],
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 20 },
}
