import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GDG Nairobi',
    short_name: 'GDG Nairobi',
    description: 'A volunteer-led developer community in Nairobi, Kenya.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f9fa',
    theme_color: '#4285f4',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
