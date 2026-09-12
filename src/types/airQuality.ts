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

export interface HistoryPoint {
  day: string
  aqi: number
}

export interface UserProfile {
  hasRespiratoryIssue: boolean
  hasYoungChild: boolean
  exercisesOutdoors: boolean
  wantsCarbonTips: boolean
}
