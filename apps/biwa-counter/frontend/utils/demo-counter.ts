import { resolveFinalCount } from '@nexttree/shared'

export type DetectionBox = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export type DemoAnalysis = {
  estimatedCount: number
  detections: DetectionBox[]
}

export type DemoCountRecord = {
  schemaVersion: 1
  source: 'demo'
  id: string
  target: 'biwa'
  fileName: string
  storeName: string
  recordDate: string
  estimatedCount: number
  correctedCount: number | null
  finalCount: number
  createdAt: string
  updatedAt: string
}

type CreateDemoRecordInput = Omit<
  DemoCountRecord,
  'schemaVersion' | 'source' | 'target' | 'finalCount' | 'updatedAt'
> & {
  updatedAt?: string
}

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_IMAGE_PIXELS = 25_000_000
const MAX_STORE_NAME_LENGTH = 80
const MAX_STORED_RECORDS = 20

const DEMO_DETECTIONS: DetectionBox[] = [
  { id: 'biwa-1', x: 12, y: 14, width: 13, height: 17 },
  { id: 'biwa-2', x: 29, y: 9, width: 14, height: 18 },
  { id: 'biwa-3', x: 49, y: 13, width: 13, height: 17 },
  { id: 'biwa-4', x: 67, y: 19, width: 14, height: 18 },
  { id: 'biwa-5', x: 19, y: 43, width: 14, height: 18 },
  { id: 'biwa-6', x: 39, y: 39, width: 13, height: 17 },
  { id: 'biwa-7', x: 58, y: 47, width: 14, height: 18 },
  { id: 'biwa-8', x: 31, y: 68, width: 14, height: 18 },
  { id: 'biwa-9', x: 55, y: 70, width: 13, height: 17 },
]

export function createDemoAnalysis(): DemoAnalysis {
  const detections = DEMO_DETECTIONS.map(detection => ({ ...detection }))

  return {
    estimatedCount: detections.length,
    detections,
  }
}

export function parseCorrectedCount(input: string): {
  value: number | null
  error: string | null
} {
  const trimmed = input.trim()
  if (trimmed === '') return { value: null, error: null }
  if (!/^\d+$/.test(trimmed)) {
    return { value: null, error: '0以上の整数で入力してください。' }
  }

  const value = Number(trimmed)
  if (!Number.isSafeInteger(value)) {
    return {
      value: null,
      error: '安全に扱える整数の範囲で入力してください。',
    }
  }

  return { value, error: null }
}

export function createDemoRecord(
  input: CreateDemoRecordInput,
): DemoCountRecord {
  return {
    schemaVersion: 1,
    source: 'demo',
    id: input.id,
    target: 'biwa',
    fileName: input.fileName,
    storeName: input.storeName.trim(),
    recordDate: input.recordDate,
    estimatedCount: input.estimatedCount,
    correctedCount: input.correctedCount,
    finalCount: resolveFinalCount(input.estimatedCount, input.correctedCount),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt ?? input.createdAt,
  }
}

export function validateRecordDetails(input: {
  storeName: string
  recordDate: string
}): {
  storeName: string | null
  recordDate: string | null
} {
  const storeName = input.storeName.trim()

  return {
    storeName: !storeName
      ? '店名を入力してください。'
      : storeName.length > MAX_STORE_NAME_LENGTH
        ? '店名は80文字以内で入力してください。'
        : null,
    recordDate: !input.recordDate
      ? '記録日を入力してください。'
      : !isValidDateInput(input.recordDate)
        ? '正しい日付を入力してください。'
        : null,
  }
}

export function parseStoredDemoRecords(
  serialized: string | null,
): DemoCountRecord[] {
  if (!serialized) return []

  try {
    const parsed: unknown = JSON.parse(serialized)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(isDemoCountRecord)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, MAX_STORED_RECORDS)
  } catch {
    return []
  }
}

export function validateImageFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'JPEG、PNG、WebPの画像を選択してください。'
  }
  if (file.size === 0) {
    return '空の画像ファイルは選択できません。'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return '画像サイズは10MB以下にしてください。'
  }

  return null
}

export function validateImageDimensions(input: {
  width: number
  height: number
}): string | null {
  if (
    !Number.isFinite(input.width)
    || !Number.isFinite(input.height)
    || input.width <= 0
    || input.height <= 0
  ) {
    return '画像を読み込めませんでした。'
  }
  if (input.width * input.height > MAX_IMAGE_PIXELS) {
    return '画像の画素数が大きすぎます。2500万画素以下にしてください。'
  }

  return null
}

export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isValidDateInput(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1000) return false

  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
}

function isDemoCountRecord(value: unknown): value is DemoCountRecord {
  if (!value || typeof value !== 'object') return false

  const record = value as Record<string, unknown>
  const correctedCount = record.correctedCount
  if (
    correctedCount !== null
    && !isNonNegativeSafeInteger(correctedCount)
  ) return false

  if (
    record.schemaVersion !== 1
    || record.source !== 'demo'
    || record.target !== 'biwa'
    || !isNonEmptyString(record.id)
    || !isNonEmptyString(record.fileName)
    || !isValidStoreName(record.storeName)
    || typeof record.recordDate !== 'string'
    || !isValidDateInput(record.recordDate)
    || !isNonNegativeSafeInteger(record.estimatedCount)
    || !isNonNegativeSafeInteger(record.finalCount)
    || !isValidIsoDate(record.createdAt)
    || !isValidIsoDate(record.updatedAt)
  ) return false

  return record.finalCount === resolveFinalCount(
    record.estimatedCount,
    correctedCount,
  )
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isSafeInteger(value)
    && value >= 0
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidStoreName(value: unknown): value is string {
  return typeof value === 'string'
    && value.trim().length > 0
    && value.trim().length <= MAX_STORE_NAME_LENGTH
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string'
    && Number.isFinite(Date.parse(value))
}
