interface YoutubeEmbedProps {
  videoId: string
  title: string
  credit: string
}

export function YoutubeEmbed({ videoId, title, credit }: YoutubeEmbedProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full rounded-t-2xl"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="p-4">
        <p className="font-medium heading-font">{title}</p>
        <p className="text-slate-500 text-xs mt-1">{credit}</p>
      </div>
    </div>
  )
}
