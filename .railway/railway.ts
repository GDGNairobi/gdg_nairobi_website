import { bucket, defineRailway, postgres, preserve, project, service, volume } from 'railway/iac'

export default defineRailway(() => {
  const Postgres = postgres('Postgres', { region: 'europe-west4-drams3a' })
  Postgres.networking = { privateNetworkEndpoint: 'postgres' }

  const postgresVolume = volume('postgres-volume', {
    alerts: { usage: { '80': {}, '95': {}, '100': {} } },
    allowOnlineResize: true,
    region: 'europe-west4-drams3a',
    sizeMB: 5000,
  })
  const devfestMedia = bucket('devfest-media', { region: 'ams' })

  const web = service('web', {
    start: 'node server.js',
    preDeploy: 'node node_modules/payload/bin.js migrate',
    healthcheck: '/api/health',
    healthcheckTimeout: 300,
    replicas: { 'europe-west4-drams3a': 1 },
    env: {
      AWS_ACCESS_KEY_ID: preserve(),
      AWS_DEFAULT_REGION: preserve(),
      AWS_ENDPOINT_URL: preserve(),
      AWS_S3_BUCKET_NAME: preserve(),
      AWS_S3_URL_STYLE: preserve(),
      AWS_SECRET_ACCESS_KEY: preserve(),
      CRON_SECRET: preserve(),
      DATABASE_URL: Postgres.env.DATABASE_URL,
      ENABLE_CMS: 'true',
      NEXT_PUBLIC_SITE_URL: preserve(),
      NODE_ENV: 'production',
      PAYLOAD_SECRET: preserve(),
    },
    deploy: {
      drainingSeconds: 30,
      overlapSeconds: 30,
    },
  })

  const eventSync = service('event-sync', {
    start: 'npm start',
    replicas: { 'europe-west4-drams3a': 1 },
    env: { APP_URL: preserve(), CRON_SECRET: preserve() },
    deploy: {
      cronSchedule: '15 0 * * *',
      restartPolicyType: 'NEVER',
    },
  })

  return project('GDG Nairobi DevFest', {
    resources: [web, eventSync, Postgres, postgresVolume, devfestMedia],
  })
})
