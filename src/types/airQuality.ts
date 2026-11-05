export interface AirQualityData {
  aqi: number
  components: {
    pm2_5: number
    pm10: number
    co: number
    no2: number
    o3: number
  }
}

export interface CityAir extends AirQualityData {
  cityName: string
  lat: number
  lon: number
}

export interface HistoryDay {
  date: string
  aqi: number
  /** Continuous US EPA AQI (0-500), computed from pollutant concentrations. */
  aqiIndex: number
  dominant: 'pm2_5' | 'pm10' | 'no2' | 'o3'
  pm2_5: number
}

export interface ForecastHour {
  dt: number
  aqi: number
  pm2_5: number
}

export interface GlobeCity {
  name: string
  query: string
  lat: number
  lon: number
  aqi: number
  pm2_5: number
}

export interface UserProfile {
  hasRespiratoryIssue: boolean
  hasYoungChild: boolean
  exercisesOutdoors: boolean
  wantsCarbonTips: boolean
}
