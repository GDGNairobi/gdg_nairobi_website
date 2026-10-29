import Image from 'next/image'
import { youtubeVideoID } from '@/lib/event-dates'

type Props = {
  videos: Array<{ title: string; url: string }>
  albums?: Array<{ title: string; url: string }>
}
export function EventMedia({ videos, albums = [] }: Props) {
  const valid = videos.flatMap((video) => {
    const id = youtubeVideoID(video.url)
    return id ? [{ ...video, id }] : []
  })
  return (
    <>
      {valid.length > 0 && (
        <div className="video-gallery">
          {valid.map((video) => (
            <a
              className="video-card"
              href={video.url}
              key={video.id}
              target="_blank"
              rel="noreferrer"
              aria-label={`Watch ${video.title}`}
            >
              <div className="video-thumbnail">
                <Image
                  src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 90vw, (max-width: 1024px) 44vw, 29vw"
                />
                <span aria-hidden="true">▶</span>
              </div>
              <div>
                <small>WATCH THE HIGHLIGHTS ↗</small>
                <h3>{video.title}</h3>
              </div>
            </a>
          ))}
        </div>
      )}
      {albums.length > 0 && (
        <div className="album-links">
          <p>Browse photo albums</p>
          {albums.map((album) => (
            <a href={album.url} key={album.url} target="_blank" rel="noreferrer">
              {album.title} ↗
            </a>
          ))}
        </div>
      )}
    </>
  )
}
