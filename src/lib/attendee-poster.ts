import { gdgMarkPaths } from '@/lib/gdg-mark'

export const posterSize = { width: 1080, height: 1350 }
export const posterPhotoFrame = { x: 72, y: 386, width: 936, height: 650 }
export type PosterDetails = { title: string; date: string; venue: string; year: number }
export type PhotoFraming = { zoom: number; x: number; y: number }
export const initialFraming: PhotoFraming = { zoom: 1, x: 0, y: 0.2 }

const font = (weight: number, size: number) => `${weight} ${size}px "Manrope Variable", sans-serif`
const ink = '#202124'
const white = '#f8f9fa'
const colors = ['#4285f4', '#ea4335', '#fbbc04', '#34a853']

function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fillStyle = fill
  ctx.fill()
}

function fittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  size: number,
  weight = 800,
) {
  let fitted = size
  ctx.font = font(weight, fitted)
  while (ctx.measureText(text).width > width && fitted > 20) ctx.font = font(weight, --fitted)
  ctx.fillText(text, x, y)
}

export function drawAttendeePoster(
  canvas: HTMLCanvasElement,
  details: PosterDetails,
  name: string,
  photo: ImageBitmap | null,
  framing: PhotoFraming,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Poster preview is unavailable in this browser.')
  ctx.clearRect(0, 0, posterSize.width, posterSize.height)
  ctx.fillStyle = ink
  ctx.fillRect(0, 0, posterSize.width, posterSize.height)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.strokeStyle = 'rgba(248,249,250,.22)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(28, 28, 1024, 1294, 38)
  ctx.stroke()

  ctx.save()
  ctx.translate(72, 76)
  ctx.scale(2, 2)
  for (const { d, fill } of gdgMarkPaths) {
    ctx.fillStyle = fill
    ctx.fill(new Path2D(d))
  }
  ctx.restore()
  ctx.fillStyle = white
  ctx.font = font(600, 26)
  ctx.fillText('GDG Nairobi', 156, 106)
  rounded(ctx, 850, 66, 158, 58, 29, 'rgba(248,249,250,.08)')
  ctx.fillStyle = white
  ctx.textAlign = 'center'
  ctx.font = font(800, 27)
  ctx.fillText(String(details.year), 929, 104)
  ctx.textAlign = 'left'
  ctx.font = font(800, 88)
  ctx.fillText('I’m attending', 72, 238)
  fittedText(ctx, details.title, 72, 326, 936, 72)
  colors.forEach((color, i) => rounded(ctx, 72 + i * 93, 350, 81, 8, 4, color))

  const frame = posterPhotoFrame
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(frame.x, frame.y, frame.width, frame.height, 30)
  ctx.clip()
  if (photo) {
    const scale = Math.max(frame.width / photo.width, frame.height / photo.height) * framing.zoom
    const w = photo.width * scale,
      h = photo.height * scale
    ctx.drawImage(
      photo,
      frame.x + (frame.width - w) / 2 + (framing.x * (w - frame.width)) / 2,
      frame.y + (frame.height - h) / 2 + (framing.y * (h - frame.height)) / 2,
      w,
      h,
    )
  } else {
    ctx.fillStyle = '#d2e3fc'
    ctx.fillRect(frame.x, frame.y, frame.width, frame.height)
    ctx.fillStyle = '#8ab4f8'
    ctx.beginPath()
    ctx.arc(540, 615, 100, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(540, 900, 225, 165, 0, Math.PI, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#174ea6'
    ctx.font = font(600, 28)
    ctx.textAlign = 'center'
    ctx.fillText('Your photo here', 540, 904)
    ctx.textAlign = 'left'
  }
  ctx.restore()
  rounded(ctx, 116, 980, 848, 122, 26, white)
  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  fittedText(ctx, name.trim() || 'See you there.', 540, 1058, 768, 48)
  ctx.textAlign = 'left'

  ctx.fillStyle = '#bdc1c6'
  ctx.font = font(600, 18)
  ctx.fillText('DATE', 72, 1168)
  ctx.fillText('VENUE', 566, 1168)
  ctx.fillStyle = white
  fittedText(ctx, details.date, 72, 1218, 442, 32, 600)
  fittedText(ctx, details.venue, 566, 1218, 442, 32, 600)
  ctx.fillStyle = '#bdc1c6'
  ctx.font = font(600, 20)
  ctx.fillText('gdgnairobi.com', 72, 1290)
  colors.forEach((color, i) => rounded(ctx, 854 + i * 41, 1274, 30, 10, 5, color))
}

export async function readPosterPhoto(file: Blob): Promise<ImageBitmap> {
  if (file.type && !file.type.startsWith('image/'))
    throw new Error('Choose an image file for your photo.')
  if (file.size > 20 * 1024 * 1024) throw new Error('Choose a photo smaller than 20 MB.')
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('This photo could not be opened. Try a JPG, PNG or WebP image.')
  }
  if (bitmap.width * bitmap.height > 60_000_000) {
    bitmap.close()
    throw new Error('This photo is too large. Try a smaller image.')
  }
  const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height))
  if (scale === 1) return bitmap
  try {
    return await createImageBitmap(bitmap, {
      resizeWidth: Math.max(1, Math.round(bitmap.width * scale)),
      resizeHeight: Math.max(1, Math.round(bitmap.height * scale)),
      resizeQuality: 'high',
    })
  } finally {
    bitmap.close()
  }
}
