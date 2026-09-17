const appURL = process.env.APP_URL
const cronSecret = process.env.CRON_SECRET

if (!appURL || !cronSecret) {
  throw new Error('APP_URL and CRON_SECRET are required')
}

const response = await fetch(`${appURL}/api/internal/events/sync`, {
  headers: {
    authorization: `Bearer ${cronSecret}`,
  },
})

const body = await response.text()

if (!response.ok) {
  throw new Error(`Event sync failed (${response.status}): ${body}`)
}

console.log(body)
