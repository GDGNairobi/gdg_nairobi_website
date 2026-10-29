import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
import { seedCommunity } from './seed/community'

try {
  const payload = await getPayload({ config })
  await seedCommunity(payload)
  await payload.destroy()
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
