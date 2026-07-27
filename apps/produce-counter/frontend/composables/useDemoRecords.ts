import { onMounted, ref } from 'vue'
import type { DemoCountRecord } from '../utils/demo-counter'
import {
  loadDemoRecords,
  saveDemoRecord,
  type DemoRecordStorage,
} from '../utils/demo-record-storage'

export function useDemoRecords() {
  const records = ref<DemoCountRecord[]>([])
  const storageError = ref<string | null>(null)
  let storage: DemoRecordStorage | null = null

  onMounted(() => {
    try {
      storage = window.localStorage
    } catch {
      storageError.value = 'このブラウザの保存機能を利用できません。'
      return
    }

    const result = loadDemoRecords(storage)
    records.value = result.records
    storageError.value = result.error
  })

  function saveRecord(record: DemoCountRecord): boolean {
    if (!storage) {
      storageError.value = 'このブラウザの保存機能を利用できません。'
      return false
    }

    const result = saveDemoRecord(storage, records.value, record)
    records.value = result.records
    storageError.value = result.error
    return result.error === null
  }

  return {
    records,
    storageError,
    saveRecord,
  }
}
