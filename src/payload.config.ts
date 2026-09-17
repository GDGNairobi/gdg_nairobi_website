import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Announcements } from './collections/Announcements'
import { CommunityEvents } from './collections/CommunityEvents'
import { DevFestEditions } from './collections/DevFestEditions'
import { Partners } from './collections/Partners'
import { Sessions } from './collections/Sessions'
import { Speakers } from './collections/Speakers'
import { TeamMembers } from './collections/TeamMembers'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseURL = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
const storageEnabled = Boolean(
  process.env.AWS_ENDPOINT_URL &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME,
)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — DevFest Nairobi',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    DevFestEditions,
    Speakers,
    Sessions,
    Partners,
    TeamMembers,
    Announcements,
    CommunityEvents,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL,
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      enabled: storageEnabled,
      collections: {
        media: true,
      },
      bucket: process.env.AWS_S3_BUCKET_NAME || '',
      config: {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
        endpoint: process.env.AWS_ENDPOINT_URL,
        forcePathStyle: process.env.AWS_S3_URL_STYLE === 'path',
        region: process.env.AWS_DEFAULT_REGION || 'auto',
      },
    }),
  ],
})
