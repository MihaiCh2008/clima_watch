import { PlanetArt } from './backgrounds/PlanetArt'
import { MountainArt } from './backgrounds/MountainArt'
import { FactoryArt } from './backgrounds/FactoryArt'

export type BackgroundVariant = 'planet' | 'mountain' | 'factory'

/** Ilustrație de fundal, specifică fiecărei pagini — doar decorativă, în spatele conținutului. */
export function PageBackground({ variant }: { variant: BackgroundVariant }) {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden opacity-[0.38]">
      {variant === 'planet' && <PlanetArt />}
      {variant === 'mountain' && <MountainArt />}
      {variant === 'factory' && <FactoryArt />}
    </div>
  )
}
