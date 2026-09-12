interface OwidEmbedProps {
  slug: string
  title: string
}

/** Grafic interactiv preluat live de pe Our World in Data — selector de țară + interval de ani inclus. */
export function OwidEmbed({ slug, title }: OwidEmbedProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="relative w-full" style={{ paddingTop: '65%' }}>
        <iframe
          className="absolute inset-0 w-full h-full rounded-t-2xl bg-white"
          src={`https://ourworldindata.org/grapher/${slug}`}
          title={title}
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <p className="font-medium heading-font">{title}</p>
        <p className="text-slate-500 text-xs mt-1">
          Sursă: Our World in Data — grafic interactiv live, poți alege orice țară din listă
        </p>
      </div>
    </div>
  )
}
