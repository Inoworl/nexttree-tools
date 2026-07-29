import {
  resolveFinalCount,
  type CountUnit,
  type ProductId,
} from '@nexttree/shared'

export type CountUnitOption = {
  id: CountUnit
  label: string
}

export type VarietyOption = {
  id: string
  label: string
  defaultCountUnit: CountUnit
}

export type ProductOption = {
  id: ProductId
  label: string
  varieties: readonly VarietyOption[]
}

export const COUNT_UNIT_OPTIONS: readonly CountUnitOption[] = [
  { id: 'pack', label: 'パック' },
  { id: 'piece', label: '個' },
  { id: 'box', label: '箱' },
]

export const PRODUCT_OPTIONS: readonly ProductOption[] = [
  {
    id: 'loquat',
    label: 'びわ',
    varieties: [
      { id: 'mogi', label: '茂木', defaultCountUnit: 'pack' },
      { id: 'tanaka', label: '田中', defaultCountUnit: 'pack' },
    ],
  },
  {
    id: 'kiwi',
    label: 'キウイ',
    varieties: [
      { id: 'hayward', label: 'ヘイワード', defaultCountUnit: 'piece' },
      { id: 'gold', label: 'ゴールド', defaultCountUnit: 'piece' },
    ],
  },
  {
    id: 'chestnut',
    label: '栗',
    varieties: [
      { id: 'tsukuba', label: '筑波', defaultCountUnit: 'pack' },
      { id: 'ginyose', label: '銀寄', defaultCountUnit: 'pack' },
    ],
  },
]

export function getProductOption(productId: ProductId): ProductOption {
  const product = PRODUCT_OPTIONS.find(option => option.id === productId)
  if (!product) throw new Error(`Unknown product: ${productId}`)
  return product
}

export function getVarietyOption(
  productId: ProductId,
  varietyId: string,
): VarietyOption {
  const variety = getProductOption(productId).varieties.find(
    option => option.id === varietyId,
  )
  if (!variety) {
    throw new Error(`Unknown variety: ${productId}/${varietyId}`)
  }
  return variety
}

export function getCountUnitLabel(countUnit: CountUnit): string {
  const option = COUNT_UNIT_OPTIONS.find(unit => unit.id === countUnit)
  if (!option) throw new Error(`Unknown count unit: ${countUnit}`)
  return option.label
}

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
  schemaVersion: 3
  source: 'demo'
  id: string
  destinationId: string
  destinationName: string
  productId: string
  productLabel: string
  varietyId: string
  varietyLabel: string
  countUnit: string
  countUnitLabel: string
  fileName: string
  recordDate: string
  estimatedCount: number
  correctedCount: number | null
  finalCount: number
  createdAt: string
  updatedAt: string
}

type CreateDemoRecordInput = Omit<
  DemoCountRecord,
  | 'schemaVersion'
  | 'source'
  | 'productId'
  | 'countUnit'
  | 'finalCount'
  | 'updatedAt'
> & {
  productId: ProductId
  countUnit: CountUnit
  updatedAt?: string
}

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_IMAGE_PIXELS = 25_000_000
const MAX_SNAPSHOT_LABEL_LENGTH = 80
const MAX_STORED_RECORDS = 20

const DEMO_DETECTIONS: DetectionBox[] = [
  { id: 'detection-1', x: 12, y: 14, width: 13, height: 17 },
  { id: 'detection-2', x: 29, y: 9, width: 14, height: 18 },
  { id: 'detection-3', x: 49, y: 13, width: 13, height: 17 },
  { id: 'detection-4', x: 67, y: 19, width: 14, height: 18 },
  { id: 'detection-5', x: 19, y: 43, width: 14, height: 18 },
  { id: 'detection-6', x: 39, y: 39, width: 13, height: 17 },
  { id: 'detection-7', x: 58, y: 47, width: 14, height: 18 },
  { id: 'detection-8', x: 31, y: 68, width: 14, height: 18 },
  { id: 'detection-9', x: 55, y: 70, width: 13, height: 17 },
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
    schemaVersion: 3,
    source: 'demo',
    id: input.id,
    destinationId: input.destinationId,
    destinationName: input.destinationName.trim(),
    productId: input.productId,
    productLabel: input.productLabel.trim(),
    varietyId: input.varietyId,
    varietyLabel: input.varietyLabel.trim(),
    countUnit: input.countUnit,
    countUnitLabel: input.countUnitLabel.trim(),
    fileName: input.fileName,
    recordDate: input.recordDate,
    estimatedCount: input.estimatedCount,
    correctedCount: input.correctedCount,
    finalCount: resolveFinalCount(input.estimatedCount, input.correctedCount),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt ?? input.createdAt,
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
      .map(migrateDemoCountRecord)
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

function migrateDemoCountRecord(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value

  const record = value as Record<string, unknown>
  if (record.schemaVersion !== 2) return value

  const unit = COUNT_UNIT_OPTIONS.find(option => option.id === record.countUnit)
  const countUnitLabel = record.countUnitLabel ?? unit?.label
  const { storeName, ...recordWithoutStoreName } = record

  return {
    ...recordWithoutStoreName,
    schemaVersion: 3,
    destinationId: 'legacy',
    destinationName: storeName,
    countUnitLabel,
  }
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
    record.schemaVersion !== 3
    || record.source !== 'demo'
    || !isNonEmptyString(record.id)
    || !isNonEmptyString(record.destinationId)
    || !isValidSnapshotLabel(record.destinationName)
    || !isNonEmptyString(record.productId)
    || !isNonEmptyString(record.productLabel)
    || !isNonEmptyString(record.varietyId)
    || !isNonEmptyString(record.varietyLabel)
    || !isNonEmptyString(record.countUnit)
    || !isNonEmptyString(record.countUnitLabel)
    || !isNonEmptyString(record.fileName)
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

function isValidSnapshotLabel(value: unknown): value is string {
  return typeof value === 'string'
    && value.trim().length > 0
    && value.trim().length <= MAX_SNAPSHOT_LABEL_LENGTH
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string'
    && Number.isFinite(Date.parse(value))
}
