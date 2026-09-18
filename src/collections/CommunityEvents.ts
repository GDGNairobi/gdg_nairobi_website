import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor, sourceFieldsReadOnly } from '@/access'

const sourceFieldAccess = { update: sourceFieldsReadOnly }
const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

export const CommunityEvents: CollectionConfig = {
  slug: 'community-events',
  access: {
    create: isEditor,
    delete: isAdmin,
    read: ({ req }) => req.user ? true : { showOnSite: { equals: true } },
    update: isEditor,
  },
  admin: {
    defaultColumns: ['localTitle', 'sourceTitle', 'eventKind', 'localStartDate', 'sourceStartDate', 'eventDestination', 'liveStatus', 'showOnSite'],
    description: 'The canonical home for every GDG Nairobi event, including DevFest. Sync, schedule, venue and live operations all live here.',
    useAsTitle: 'sourceTitle',
  },
  hooks: {
    beforeValidate: [({ data, originalDoc }) => {
      if (data?.eventDestination === 'schedule' && !data.slug) {
        data.slug = slugify(data.localTitle || data.sourceTitle || originalDoc?.sourceTitle || '')
      }
      return data
    }],
  },
  fields: [
    { name: 'source', type: 'select', defaultValue: 'manual', options: [{ label: 'Locally managed', value: 'manual' }, { label: 'GDG Community sync', value: 'bevy' }], required: true, admin: { readOnly: true }, access: sourceFieldAccess },
    {
      name: 'upstreamURL',
      label: 'Upstream event URL (optional)',
      type: 'text',
      unique: true,
      index: true,
      admin: { description: 'Used to match synchronized events. Leave empty for locally managed events.', readOnly: true },
      access: sourceFieldAccess,
    },
    { name: 'sourceTitle', type: 'text', admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'sourceStartDate', type: 'date', admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'sourceType', type: 'text', admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'registrationURL', type: 'text', admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'imageURL', type: 'text', admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'excerpt', type: 'textarea', admin: { readOnly: true }, access: sourceFieldAccess },
    {
      name: 'upstreamStatus',
      type: 'select',
      options: ['live', 'completed', 'stale'],
      admin: { readOnly: true },
      access: sourceFieldAccess,
    },
    { name: 'lastSyncedAt', type: 'date', admin: { readOnly: true }, access: sourceFieldAccess },
    { name: 'showOnSite', type: 'checkbox', defaultValue: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'eventKind',
      label: 'Event type',
      type: 'select',
      defaultValue: 'community',
      required: true,
      options: [
        { label: 'Community event', value: 'community' },
        { label: 'Workshop / codelab', value: 'workshop' },
        { label: 'DevFest', value: 'devfest' },
        { label: 'I/O Extended', value: 'io-extended' },
        { label: 'Build with AI', value: 'build-with-ai' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'localLabel', type: 'text', admin: { description: 'Optional short label such as “Workshop” or “Community day”.' } },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
    {
      name: 'eventDestination',
      label: 'Event experience',
      type: 'select',
      defaultValue: 'community',
      required: true,
      options: [
        { label: 'Community page (external)', value: 'community' },
        { label: 'Schedule on this website', value: 'schedule' },
      ],
      admin: {
        description: 'Choose one destination for the event card. The synced Community event remains the canonical record.',
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        condition: (_, siblingData) => siblingData?.eventDestination === 'schedule',
        description: 'Generated from the title when the internal schedule is enabled.',
      },
    },
    {
      name: 'scheduleMode',
      label: 'Schedule layout',
      type: 'select',
      defaultValue: 'single',
      options: [
        { label: 'Single track', value: 'single' },
        { label: 'Multiple tracks', value: 'multi' },
      ],
      admin: { condition: (_, siblingData) => siblingData?.eventDestination === 'schedule' },
    },
    {
      name: 'localTitle',
      label: 'Display title',
      type: 'text',
      admin: {
        description: 'Optional public title override; the synchronized title is used when empty.',
      },
    },
    {
      name: 'localStartDate',
      label: 'Public event date override',
      type: 'date',
      admin: {
        description: 'Optional. Useful when the public date changes without changing the upstream record.',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd MMM yyyy, HH:mm' },
      },
    },
    {
      name: 'localRegistrationURL',
      label: 'Registration URL override',
      type: 'text',
      admin: { description: 'Optional destination when there is no upstream URL or registration moves elsewhere.' },
    },
    {
      name: 'localDescription',
      label: 'Event summary',
      type: 'textarea',
      admin: { condition: (_, siblingData) => siblingData?.eventDestination === 'schedule' },
    },
    {
      name: 'venueName',
      type: 'text',
      admin: { condition: (_, siblingData) => siblingData?.eventDestination === 'schedule' },
    },
    {
      name: 'venueAddress',
      type: 'textarea',
      admin: { condition: (_, siblingData) => siblingData?.eventDestination === 'schedule' },
    },
    {
      name: 'liveStatus',
      label: 'Live schedule status',
      type: 'select',
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Delayed', value: 'delayed' },
        { label: 'In progress', value: 'live' },
        { label: 'Complete', value: 'complete' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.eventDestination === 'schedule',
        position: 'sidebar',
      },
    },
    {
      name: 'scheduleStartOverride',
      label: 'Actual schedule start',
      type: 'date',
      admin: {
        condition: (_, siblingData) => siblingData?.eventDestination === 'schedule',
        description: 'Live control: set the actual start time and every session moves by the same amount. Clear it to use the planned times.',
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd MMM yyyy, HH:mm' },
      },
    },
    {
      name: 'scheduleOffsetMinutes',
      label: 'Shift the entire schedule (minutes)',
      type: 'number',
      defaultValue: 0,
      min: -180,
      max: 360,
      admin: {
        condition: (_, siblingData) => siblingData?.eventDestination === 'schedule',
        description: 'Optional fine adjustment. The actual start control above takes priority when set.',
        position: 'sidebar',
        step: 5,
      },
    },
    {
      name: 'scheduleNotice',
      label: 'Live schedule notice',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.eventDestination === 'schedule',
        description: 'Short public message, for example “Running 15 minutes behind”.',
        position: 'sidebar',
      },
    },
    {
      name: 'sessions',
      label: 'Event sessions',
      type: 'join',
      collection: 'sessions',
      on: 'event',
      defaultLimit: 100,
      defaultSort: 'startsAt',
      admin: {
        allowCreate: true,
        condition: (_, siblingData) => siblingData?.eventDestination === 'schedule',
        defaultColumns: ['title', 'startsAt', 'scheduleTrack', 'sessionStatus', 'room', '_status'],
        description: 'Create and update this event’s sessions without leaving the event management screen.',
      },
    },
    {
      name: 'eventPage',
      label: 'Campaign page content',
      type: 'join',
      collection: 'devfest-editions',
      on: 'event',
      defaultLimit: 1,
      admin: {
        allowCreate: true,
        condition: (_, siblingData) => siblingData?.eventKind === 'devfest',
        defaultColumns: ['title', 'year', 'status', '_status'],
        description: 'Optional DevFest campaign presentation attached to this event—not a second event record.',
      },
    },
  ],
}
