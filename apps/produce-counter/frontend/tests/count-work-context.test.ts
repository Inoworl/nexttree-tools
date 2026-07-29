import { describe, expect, it } from 'vitest'
import {
  createCountEntryLocation,
  resolveCountWorkContext,
  validateWorkContextSelection,
} from '../utils/count-work-context'
import {
  DESTINATION_OPTIONS,
  getDestinationOption,
} from '../utils/destination-catalog'

describe('卸先カタログ', () => {
  it('UI確認用の卸先を一意なIDで公開する', () => {
    expect(DESTINATION_OPTIONS).toEqual([
      { id: 'central-market', label: '中央青果市場（デモ）' },
      { id: 'harbor-store', label: '港青果店（デモ）' },
      { id: 'direct-shop', label: '直売所（デモ）' },
    ])
  })

  it('卸先IDと表示名を空にせずIDを重複させない', () => {
    const ids = DESTINATION_OPTIONS.map(destination => destination.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(
      DESTINATION_OPTIONS.every(destination => (
        destination.id.trim() !== '' && destination.label.trim() !== ''
      )),
    ).toBe(true)
  })

  it('存在する卸先だけをIDから取得する', () => {
    expect(getDestinationOption('harbor-store')).toEqual({
      id: 'harbor-store',
      label: '港青果店（デモ）',
    })
    expect(getDestinationOption('unknown')).toBeNull()
  })
})

describe('resolveCountWorkContext', () => {
  it('URLクエリから卸先名を解決して作業コンテキストを復元する', () => {
    expect(resolveCountWorkContext({
      destinationId: 'central-market',
      recordDate: '2026-07-30',
    })).toEqual({
      destinationId: 'central-market',
      destinationName: '中央青果市場（デモ）',
      recordDate: '2026-07-30',
    })
  })

  it.each([
    {},
    { destinationId: 'unknown', recordDate: '2026-07-30' },
    { destinationId: 'central-market', recordDate: '2026-02-30' },
    { destinationId: ['central-market'], recordDate: '2026-07-30' },
  ])('不足・不正なクエリ %j を拒否する', (query) => {
    expect(resolveCountWorkContext(query)).toBeNull()
  })
})

describe('作業開始入力', () => {
  it('卸先と実在する記録日を必須にする', () => {
    expect(validateWorkContextSelection({
      destinationId: '',
      recordDate: '2026-02-30',
    })).toEqual({
      destinationId: '卸先を選択してください。',
      recordDate: '正しい日付を入力してください。',
    })
  })

  it('表示名をURLに含めずIDと日付だけで遷移先を作る', () => {
    expect(createCountEntryLocation({
      destinationId: 'direct-shop',
      recordDate: '2026-07-30',
    })).toEqual({
      path: '/count/entry',
      query: {
        destinationId: 'direct-shop',
        recordDate: '2026-07-30',
      },
    })
  })
})
