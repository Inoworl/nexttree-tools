import {
  parseStoredDemoRecords,
  type DemoCountRecord,
} from './demo-counter'

export const DEMO_STORAGE_KEY = 'nexttree:produce-counter:demo:v2'

export type DemoRecordStorage = Pick<Storage, 'getItem' | 'setItem'>

export type DemoStorageResult = {
  records: DemoCountRecord[]
  error: string | null
}

export function loadDemoRecords(
  storage: DemoRecordStorage,
): DemoStorageResult {
  try {
    return {
      records: parseStoredDemoRecords(storage.getItem(DEMO_STORAGE_KEY)),
      error: null,
    }
  } catch {
    return {
      records: [],
      error: 'このブラウザの保存済み記録を読み込めませんでした。',
    }
  }
}

export function saveDemoRecord(
  storage: DemoRecordStorage,
  currentRecords: DemoCountRecord[],
  record: DemoCountRecord,
): DemoStorageResult {
  const records = parseStoredDemoRecords(
    JSON.stringify([record, ...currentRecords]),
  )

  try {
    storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(records))
    return { records, error: null }
  } catch {
    return {
      records: currentRecords,
      error: 'このブラウザに記録を保存できませんでした。',
    }
  }
}
