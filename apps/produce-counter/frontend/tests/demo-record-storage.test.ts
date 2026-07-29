import { describe, expect, it } from 'vitest'
import { createDemoRecord } from '../utils/demo-counter'
import {
  DEMO_STORAGE_KEY,
  loadDemoRecords,
  saveDemoRecord,
  type DemoRecordStorage,
} from '../utils/demo-record-storage'

function makeRecord(id = 'demo-1', second = 0) {
  const timestamp = new Date(Date.UTC(2026, 6, 15, 10, 0, second)).toISOString()

  return createDemoRecord({
    id,
    createdAt: timestamp,
    fileName: `${id}.jpg`,
    destinationId: 'harbor-store',
    destinationName: '港青果店（デモ）',
    recordDate: '2026-07-14',
    productId: 'loquat',
    productLabel: 'びわ',
    varietyId: 'mogi',
    varietyLabel: '茂木',
    countUnit: 'pack',
    countUnitLabel: 'パック',
    estimatedCount: 9,
    correctedCount: null,
  })
}

function createMemoryStorage(initialValue: string | null = null): {
  storage: DemoRecordStorage
  values: Map<string, string>
} {
  const values = new Map<string, string>()
  if (initialValue !== null) values.set(DEMO_STORAGE_KEY, initialValue)

  return {
    values,
    storage: {
      getItem(key) {
        return values.get(key) ?? null
      },
      setItem(key, value) {
        values.set(key, value)
      },
    },
  }
}

describe('DEMO_STORAGE_KEY', () => {
  it('produce-counter専用のv3キーを使う', () => {
    expect(DEMO_STORAGE_KEY).toBe('nexttree:produce-counter:demo:v3')
  })
})

describe('loadDemoRecords', () => {
  it('保存済みのデモ記録を復元する', () => {
    const record = makeRecord()
    const { storage } = createMemoryStorage(JSON.stringify([record]))

    expect(loadDemoRecords(storage)).toEqual({
      records: [record],
      error: null,
    })
  })

  it('読込に失敗した場合は空配列とエラーを返す', () => {
    const storage: DemoRecordStorage = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {},
    }

    expect(loadDemoRecords(storage)).toEqual({
      records: [],
      error: 'このブラウザの保存済み記録を読み込めませんでした。',
    })
  })

  it('v2記録の店名を卸先スナップショットへ移行する', () => {
    const legacyRecord = {
      ...makeRecord(),
      schemaVersion: 2,
      storeName: '旧店舗',
    }
    delete (legacyRecord as Partial<typeof legacyRecord>).destinationId
    delete (legacyRecord as Partial<typeof legacyRecord>).destinationName
    const { storage } = createMemoryStorage()
    storage.setItem(
      'nexttree:produce-counter:demo:v2',
      JSON.stringify([legacyRecord]),
    )

    expect(loadDemoRecords(storage).records[0]).toMatchObject({
      schemaVersion: 3,
      destinationId: 'legacy',
      destinationName: '旧店舗',
    })
  })

  it('v3が壊れていても正常なv2記録を復元する', () => {
    const legacyRecord = {
      ...makeRecord(),
      schemaVersion: 2,
      storeName: '旧店舗',
    }
    delete (legacyRecord as Partial<typeof legacyRecord>).destinationId
    delete (legacyRecord as Partial<typeof legacyRecord>).destinationName
    const { storage } = createMemoryStorage('{broken')
    storage.setItem(
      'nexttree:produce-counter:demo:v2',
      JSON.stringify([legacyRecord]),
    )

    expect(loadDemoRecords(storage).records[0]).toMatchObject({
      destinationId: 'legacy',
      destinationName: '旧店舗',
    })
  })

  it('v2とv3をIDで統合し、同一IDはv3を優先する', () => {
    const current = makeRecord('same-id')
    const duplicateLegacy = {
      ...current,
      schemaVersion: 2,
      storeName: '旧店舗',
    }
    delete (duplicateLegacy as Partial<typeof duplicateLegacy>).destinationId
    delete (duplicateLegacy as Partial<typeof duplicateLegacy>).destinationName
    const legacyOnly = {
      ...makeRecord('legacy-only', 1),
      schemaVersion: 2,
      storeName: '旧卸先',
    }
    delete (legacyOnly as Partial<typeof legacyOnly>).destinationId
    delete (legacyOnly as Partial<typeof legacyOnly>).destinationName
    const { storage } = createMemoryStorage(JSON.stringify([current]))
    storage.setItem(
      'nexttree:produce-counter:demo:v2',
      JSON.stringify([duplicateLegacy, legacyOnly]),
    )

    const records = loadDemoRecords(storage).records
    expect(records).toHaveLength(2)
    expect(records.find(record => record.id === 'same-id')).toEqual(current)
    expect(records.find(record => record.id === 'legacy-only')).toMatchObject({
      destinationId: 'legacy',
      destinationName: '旧卸先',
    })
  })
})

describe('saveDemoRecord', () => {
  it('新しい記録を先頭に保存する', () => {
    const older = makeRecord('demo-old', 0)
    const newer = makeRecord('demo-new', 1)
    const { storage, values } = createMemoryStorage()

    const result = saveDemoRecord(storage, [older], newer)

    expect(result).toEqual({ records: [newer, older], error: null })
    expect(JSON.parse(values.get(DEMO_STORAGE_KEY) ?? '[]')).toEqual([
      newer,
      older,
    ])
  })

  it('保存に失敗した場合は既存記録を保持してエラーを返す', () => {
    const existing = [makeRecord('demo-old')]
    const storage: DemoRecordStorage = {
      getItem() {
        return null
      },
      setItem() {
        throw new Error('quota exceeded')
      },
    }

    expect(saveDemoRecord(storage, existing, makeRecord('demo-new'))).toEqual({
      records: existing,
      error: 'このブラウザに記録を保存できませんでした。',
    })
  })
})
