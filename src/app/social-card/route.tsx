import OpenGraphImage from '@/app/(frontend)/opengraph-image'

export const dynamic = 'force-static'

export function GET() {
  return OpenGraphImage()
}
