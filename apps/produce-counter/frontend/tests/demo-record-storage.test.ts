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
    storeName: '港店',
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
  it('produce-counter専用のv2キーを使う', () => {
    expect(DEMO_STORAGE_KEY).toBe('nexttree:produce-counter:demo:v2')
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
