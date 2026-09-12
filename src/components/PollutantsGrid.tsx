import { PollutantCard } from './PollutantCard'
import type { AirQualityData } from '../types/airQuality'

export function PollutantsGrid({ components }: { components: AirQualityData['components'] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <PollutantCard label="PM2.5" value={components.pm2_5} unit="μg/m³" />
      <PollutantCard label="PM10" value={components.pm10} unit="μg/m³" />
      <PollutantCard label="CO" value={components.co} unit="μg/m³" />
      <PollutantCard label="NO2" value={components.no2} unit="μg/m³" />
      <PollutantCard label="O3" value={components.o3} unit="μg/m³" />
    </div>
  )
}
