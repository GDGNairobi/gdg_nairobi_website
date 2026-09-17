import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor, publishedOrEditor } from '@/access'

export const DevFestEditions: CollectionConfig = {
  slug: 'devfest-editions',
  access: {
    create: isEditor,
    delete: isAdmin,
    read: publishedOrEditor,
    update: isEditor,
  },
  admin: {
    defaultColumns: ['title', 'year', 'status', '_status', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'year', type: 'number', required: true, unique: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'status',
      label: 'Event phase',
      type: 'select',
      enumName: 'enum_devfest_editions_event_phase',
      defaultValue: 'announcement',
      required: true,
      options: [
        { label: 'Announcement', value: 'announcement' },
        { label: 'Call for papers open', value: 'cfp-open' },
        { label: 'Registration open', value: 'registration-open' },
        { label: 'Live', value: 'live' },
        { label: 'Ended', value: 'ended' },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Karibu Nairobi' },
        { name: 'headline', type: 'text', defaultValue: 'The future', required: true },
        { name: 'accentLine', type: 'text', defaultValue: 'grows here.', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'artwork', type: 'upload', relationTo: 'media' },
        {
          name: 'signals',
          type: 'array',
          maxRows: 3,
          fields: [{ name: 'label', type: 'text', required: true }],
        },
        { name: 'scrollLabel', type: 'text', defaultValue: 'Scroll to grow' },
      ],
    },
    {
      name: 'eventDetails',
      type: 'group',
      fields: [
        { name: 'startsAt', type: 'date' },
        { name: 'endsAt', type: 'date' },
        { name: 'venueName', type: 'text' },
        { name: 'address', type: 'textarea' },
        { name: 'mapURL', type: 'text' },
        { name: 'locationLabel', type: 'text', defaultValue: 'Nairobi, Kenya' },
      ],
    },
    {
      name: 'callsToAction',
      type: 'array',
      maxRows: 3,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'primary',
          options: ['primary', 'secondary', 'text'],
        },
      ],
    },
    {
      name: 'ticker',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          name: 'items',
          type: 'array',
          maxRows: 10,
          fields: [{ name: 'label', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'storySection',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'kicker', type: 'text', defaultValue: 'Community-led, Nairobi-built' },
        { name: 'heading', type: 'text', defaultValue: 'A local home for people who build.' },
        {
          name: 'paragraphs',
          type: 'array',
          dbName: 'story_paragraphs',
          maxRows: 4,
          fields: [{ name: 'text', type: 'textarea', required: true }],
        },
        { name: 'quote', type: 'text', defaultValue: 'There is a seat for you here.' },
      ],
    },
    {
      name: 'tracksSection',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'kicker', type: 'text', defaultValue: 'What grows here' },
        { name: 'heading', type: 'textarea', defaultValue: 'Four paths.\nOne ecosystem.' },
        { name: 'intro', type: 'textarea' },
      ],
    },
    {
      name: 'tracks',
      type: 'array',
      maxRows: 8,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'accent', type: 'select', options: ['blue', 'red', 'yellow', 'green'], required: true },
        { name: 'topics', type: 'text', hasMany: true },
      ],
    },
    {
      name: 'experienceSection',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'kicker', type: 'text', defaultValue: 'The experience' },
        { name: 'heading', type: 'textarea', defaultValue: 'Make it.\nThen meet around it.' },
        { name: 'marker', type: 'text', defaultValue: '2' },
        { name: 'markerLabel', type: 'textarea', defaultValue: 'Ways to\ngo deep' },
        {
          name: 'items',
          type: 'array',
          dbName: 'experience_items',
          maxRows: 4,
          fields: [
            { name: 'eyebrow', type: 'text', required: true },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      name: 'cfpSection',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'badge', type: 'text', defaultValue: 'CFP / 2026' },
        { name: 'kicker', type: 'text', defaultValue: 'Bring your voice' },
        { name: 'heading', type: 'textarea' },
        { name: 'description', type: 'textarea' },
        { name: 'ctaLabel', type: 'text', defaultValue: 'Register your interest' },
        { name: 'ctaURL', type: 'text' },
        { name: 'artLabelTop', type: 'text', defaultValue: 'Your story' },
        { name: 'artLabelBottom', type: 'text', defaultValue: 'Our stage' },
      ],
    },
    {
      name: 'eventsSection',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'kicker', type: 'text', defaultValue: 'The root system' },
        { name: 'heading', type: 'text', defaultValue: 'The community never stops.' },
        { name: 'allEventsLabel', type: 'text', defaultValue: 'All GDG Nairobi events' },
        { name: 'allEventsURL', type: 'text', defaultValue: 'https://gdg.community.dev/gdg-nairobi/' },
        { name: 'syncNote', type: 'text' },
      ],
    },
    {
      name: 'closingSection',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'kicker', type: 'text', defaultValue: 'Nairobi / 2026' },
        { name: 'heading', type: 'text', defaultValue: 'Come curious.' },
        { name: 'accentLine', type: 'text', defaultValue: 'Leave connected.' },
        { name: 'primaryLabel', type: 'text', defaultValue: 'Stay in the loop' },
        { name: 'primaryURL', type: 'text' },
        { name: 'secondaryLabel', type: 'text', defaultValue: 'Partner with DevFest' },
        { name: 'secondaryURL', type: 'text', defaultValue: '/partners' },
      ],
    },
    {
      name: 'statistics',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'featuredCommunityEvent',
      type: 'relationship',
      relationTo: 'community-events',
      filterOptions: { showOnSite: { equals: true } },
    },
  ],
  versions: {
    drafts: { autosave: true, schedulePublish: true },
    maxPerDoc: 30,
  },
}
