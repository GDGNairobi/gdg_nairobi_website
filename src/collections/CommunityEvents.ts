import type { CollectionConfig, Field } from 'payload'

import { isAdmin, isEditor, sourceFieldsReadOnly } from '@/access'
import { eventDayKey, youtubeVideoID } from '@/lib/event-dates'
import { scheduleEndpoints } from '@/lib/schedule-endpoints'

const sourceAccess = { update: sourceFieldsReadOnly }
const urlField = (name: string, label: string): Field => ({
  name,
  label,
  type: 'text',
  validate: (value: unknown) => {
    if (!value) return true
    try {
      return (
        ['https:', 'http:'].includes(new URL(String(value)).protocol) || 'Use an http or https URL.'
      )
    } catch {
      return 'Enter a complete URL.'
    }
  },
})

export const CommunityEvents: CollectionConfig = {
  slug: 'community-events',
  endpoints: scheduleEndpoints,
  labels: { singular: 'Event', plural: 'Events' },
  access: {
    create: isEditor,
    delete: isAdmin,
    update: isEditor,
    read: ({ req }) =>
      req.user ? true : { showOnSite: { equals: true }, _status: { equals: 'published' } },
  },
  admin: {
    group: 'Community',
    useAsTitle: 'localTitle',
    defaultColumns: ['localTitle', 'editionYear', 'eventKind', 'featured', '_status'],
    description:
      'One record per event or edition. Manage its days, venues, programme, registration and media here. Publish when ready.',
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data
        const title =
          data.localTitle || data.sourceTitle || originalDoc?.localTitle || originalDoc?.sourceTitle
        if (!data.localTitle && title) data.localTitle = title
        if (!data.slug && !originalDoc?.slug && title)
          data.slug = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        return data
      },
    ],
  },
  fields: [
    { name: 'seedRevision', type: 'text', admin: { hidden: true } },
    { name: 'localTitle', label: 'Event name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Public URL: /events/your-slug. Generated from the name; keep it stable after publishing.',
      },
    },
    {
      name: 'featured',
      label: 'Feature on the homepage',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'showOnSite',
      label: 'Show on website',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Uncheck to hide an event without deleting it.' },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first among featured events.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'eventKind',
              label: 'Event type',
              type: 'select',
              required: true,
              defaultValue: 'community',
              options: [
                { label: 'Community event', value: 'community' },
                { label: 'Workshop / codelab', value: 'workshop' },
                { label: 'DevFest', value: 'devfest' },
                { label: 'I/O Extended', value: 'io-extended' },
                { label: 'Build with AI', value: 'build-with-ai' },
              ],
            },
            {
              name: 'editionYear',
              type: 'number',
              label: 'Edition year',
              min: 2000,
              max: 2200,
              admin: {
                description: 'Also groups historical events when the exact date is not known.',
              },
            },
            { name: 'tagline', type: 'text' },
            { name: 'localDescription', label: 'Event introduction', type: 'textarea' },
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            {
              name: 'registrationStatus',
              type: 'select',
              defaultValue: 'announced',
              options: [
                { label: 'Announced', value: 'announced' },
                { label: 'Registration open', value: 'open' },
                { label: 'Registration closed', value: 'closed' },
              ],
            },
            {
              name: 'registrationLabel',
              label: 'Registration button label',
              type: 'text',
              admin: { description: 'Leave empty for “Register for [event name]”.' },
            },
            urlField('localRegistrationURL', 'Registration link'),
            { name: 'localLabel', label: 'Short card label', type: 'text' },
          ],
        },
        {
          label: 'Days & venues',
          fields: [
            {
              name: 'days',
              label: 'Event days',
              type: 'array',
              dbName: 'event_days',
              admin: {
                description:
                  'Add one row per day. Each day has its own venue and directions. Dates use East Africa Time.',
                initCollapsed: true,
                components: { RowLabel: '@/components/admin/EventDayLabel#EventDayLabel' },
              },
              fields: [
                {
                  name: 'title',
                  label: 'Day name',
                  type: 'text',
                  required: true,
                  admin: { placeholder: 'Conference day / Workshops / Day 2' },
                },
                {
                  name: 'date',
                  type: 'date',
                  required: true,
                  admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' } },
                },
                { name: 'description', label: 'What to expect', type: 'textarea' },
                { name: 'venueName', label: 'Venue name', type: 'text' },
                { name: 'venueAddress', label: 'Address', type: 'textarea' },
                urlField('venueWebsite', 'Venue website'),
                urlField('mapURL', 'Directions link'),
              ],
              validate: (value: unknown) => {
                if (!Array.isArray(value)) return true
                const keys = value
                  .map((day: { date?: string }) => (day.date ? eventDayKey(day.date) : ''))
                  .filter(Boolean)
                return (
                  new Set(keys).size === keys.length ||
                  'Use one day row per calendar date. Add sessions for activities on the same day.'
                )
              },
            },
          ],
        },
        {
          label: 'Programme',
          fields: [
            {
              name: 'scheduleImport',
              type: 'ui',
              admin: { components: { Field: '@/components/admin/ScheduleImport#ScheduleImport' } },
            },
            {
              name: 'scheduleMode',
              label: 'Programme layout',
              type: 'select',
              defaultValue: 'single',
              options: [
                { label: 'Single track', value: 'single' },
                { label: 'Multiple tracks', value: 'multi' },
              ],
            },
            {
              name: 'liveStatus',
              label: 'Live event status',
              type: 'select',
              defaultValue: 'scheduled',
              options: [
                { label: 'Scheduled', value: 'scheduled' },
                { label: 'Delayed', value: 'delayed' },
                { label: 'In progress', value: 'live' },
                { label: 'Complete', value: 'complete' },
              ],
            },
            {
              name: 'scheduleStartOverride',
              label: 'Actual programme start',
              type: 'date',
              admin: {
                description:
                  'Move all sessions together by setting the actual first-session start. Clear to restore planned times.',
              },
            },
            {
              name: 'scheduleOffsetMinutes',
              label: 'Programme adjustment (minutes)',
              type: 'number',
              defaultValue: 0,
              min: -180,
              max: 360,
            },
            { name: 'scheduleNotice', label: 'Attendee notice', type: 'text' },
            {
              name: 'sessions',
              type: 'join',
              collection: 'sessions',
              on: 'event',
              defaultLimit: 100,
              defaultSort: 'startsAt',
              admin: {
                allowCreate: true,
                defaultColumns: ['title', 'startsAt', 'scheduleTrack', 'room', '_status'],
                description:
                  'Create sessions here to attach them to this event automatically. The session date selects its event day and venue.',
              },
            },
          ],
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'videos',
              type: 'array',
              dbName: 'event_videos',
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  validate: (value: unknown) =>
                    !value || youtubeVideoID(String(value))
                      ? true
                      : 'Use a valid YouTube video URL.',
                },
                {
                  name: 'featured',
                  label: 'Show in community highlights',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
            },
            {
              name: 'albums',
              label: 'Photo albums',
              type: 'array',
              dbName: 'event_albums',
              fields: [
                { name: 'title', type: 'text', required: true },
                urlField('url', 'Album link'),
              ],
            },
          ],
        },
        {
          label: 'Imported source',
          fields: [
            {
              name: 'source',
              type: 'select',
              defaultValue: 'manual',
              required: true,
              options: [
                { label: 'Locally managed', value: 'manual' },
                { label: 'GDG Community sync', value: 'bevy' },
              ],
              admin: { readOnly: true },
              access: sourceAccess,
            },
            {
              name: 'upstreamURL',
              type: 'text',
              unique: true,
              index: true,
              admin: { readOnly: true },
              access: sourceAccess,
            },
            { name: 'sourceTitle', type: 'text', admin: { readOnly: true }, access: sourceAccess },
            {
              name: 'sourceStartDate',
              type: 'date',
              admin: { readOnly: true },
              access: sourceAccess,
            },
            { name: 'sourceType', type: 'text', admin: { readOnly: true }, access: sourceAccess },
            {
              name: 'registrationURL',
              type: 'text',
              admin: { readOnly: true },
              access: sourceAccess,
            },
            { name: 'imageURL', type: 'text', admin: { readOnly: true }, access: sourceAccess },
            { name: 'excerpt', type: 'textarea', admin: { readOnly: true }, access: sourceAccess },
            {
              name: 'upstreamStatus',
              type: 'select',
              options: ['live', 'completed', 'stale'],
              admin: { readOnly: true },
              access: sourceAccess,
            },
            { name: 'lastSyncedAt', type: 'date', admin: { readOnly: true }, access: sourceAccess },
          ],
        },
      ],
    },
  ],
  versions: { drafts: { autosave: true, schedulePublish: true }, maxPerDoc: 30 },
}
