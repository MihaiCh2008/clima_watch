import { readFile, writeFile } from 'node:fs/promises'

/**
 * One hour of one city. `obs*` is the ground truth (median of the city's Sensor.Community
 * sensors); `owm*` is OpenWeatherMap's gridded air-pollution estimate; the rest is ERA5 weather.
 */
export interface HourRow {
  /** UTC hour start, epoch seconds. */
  ts: number
  obsPm25: number | null
  obsPm10: number | null
  sensors: number
  owmAqi: number
  owmCo: number
  owmNo: number
  owmNo2: number
  owmO3: number
  owmSo2: number
  owmPm25: number
  owmPm10: number
  owmNh3: number
  temp: number
  rh: number
  wind: number
  windDir: number
  pressure: number
  precip: number
  /** Boundary-layer height, m. */
  blh: number
}

const COLUMNS: Array<keyof HourRow> = [
  'ts', 'obsPm25', 'obsPm10', 'sensors',
  'owmAqi', 'owmCo', 'owmNo', 'owmNo2', 'owmO3', 'owmSo2', 'owmPm25', 'owmPm10', 'owmNh3',
  'temp', 'rh', 'wind', 'windDir', 'pressure', 'precip', 'blh',
]

const NULLABLE = new Set<keyof HourRow>(['obsPm25', 'obsPm10'])

export async function writeDataset(path: string, rows: HourRow[]): Promise<void> {
  const lines = [COLUMNS.join(',')]
  for (const row of rows) lines.push(COLUMNS.map((c) => (row[c] === null ? '' : String(row[c]))).join(','))
  await writeFile(path, `${lines.join('\n')}\n`)
}

export function parseDataset(csv: string): HourRow[] {
  const [header, ...lines] = csv.trim().split('\n')
  const names = header.split(',')
  return lines.map((line) => {
    const cells = line.split(',')
    const row: Record<string, number | null> = {}
    names.forEach((name, i) => {
      const key = name as keyof HourRow
      row[name] = cells[i] === '' && NULLABLE.has(key) ? null : Number(cells[i])
    })
    return row as unknown as HourRow
  })
}

export async function readDataset(path: string): Promise<HourRow[]> {
  return parseDataset(await readFile(path, 'utf8'))
}
