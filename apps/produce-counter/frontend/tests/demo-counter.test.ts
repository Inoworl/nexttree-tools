import type { CountUnit, ProductId } from '@nexttree/shared'
import { describe, expect, it } from 'vitest'
import {
  COUNT_UNIT_OPTIONS,
  PRODUCT_OPTIONS,
  createDemoAnalysis,
  createDemoRecord,
  formatDateInputValue,
  parseCorrectedCount,
  parseStoredDemoRecords,
  validateImageDimensions,
  validateImageFile,
  validateRecordDetails,
  type DemoCountRecord,
  getCountUnitLabel,
  getProductOption,
  getVarietyOption,
} from '../utils/demo-counter'

describe('商品・品種・単位マスタ', () => {
  it('びわ・キウイ・栗と全品種の既定単位を公開する', () => {
    expect(PRODUCT_OPTIONS).toEqual([
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
    ])
  })

  it('商品と品種の設定をIDで取得できる', () => {
    expect(getProductOption('kiwi').label).toBe('キウイ')
    expect(getVarietyOption('chestnut', 'ginyose').label).toBe('銀寄')
  })

  it('単位コードを日本語表示へ変換する', () => {
    expect(COUNT_UNIT_OPTIONS).toHaveLength(3)
    expect(getCountUnitLabel('pack')).toBe('パック')
    expect(getCountUnitLabel('piece')).toBe('個')
    expect(getCountUnitLabel('box')).toBe('箱')
  })
})

type MakeRecordOverrides = Partial<
  Omit<DemoCountRecord, 'productId' | 'countUnit'>
> & {
  productId?: ProductId
  countUnit?: CountUnit
}

function makeRecord(
  overrides: MakeRecordOverrides = {},
): DemoCountRecord {
  return createDemoRecord({
    id: 'demo-1',
    createdAt: '2026-07-15T10:00:00.000Z',
    fileName: 'produce.jpg',
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
    ...overrides,
  })
}

describe('createDemoAnalysis', () => {
  it('赤枠の数と推定個数を一致させる', () => {
    const result = createDemoAnalysis()

    expect(result.estimatedCount).toBe(result.detections.length)
  })

  it('1件以上の検出結果を返す', () => {
    expect(createDemoAnalysis().detections.length).toBeGreaterThan(0)
  })

  it('すべての赤枠を画像内の割合座標として返す', () => {
    const result = createDemoAnalysis()

    expect(
      result.detections.every(({ x, y, width, height }) =>
        x >= 0
        && y >= 0
        && width > 0
        && height > 0
        && x + width <= 100
        && y + height <= 100,
      ),
    ).toBe(true)
  })

  it('赤枠ごとに一意なIDを返す', () => {
    const ids = createDemoAnalysis().detections.map(({ id }) => id)

    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('parseCorrectedCount', () => {
  it('空欄は未修正として扱う', () => {
    expect(parseCorrectedCount('')).toEqual({ value: null, error: null })
  })

  it('前後の空白を除いた0以上の整数を修正値として扱う', () => {
    expect(parseCorrectedCount(' 12 ')).toEqual({ value: 12, error: null })
  })

  it('0を有効な修正値として扱う', () => {
    expect(parseCorrectedCount('0')).toEqual({ value: 0, error: null })
  })

  it('負数や小数は入力エラーとして扱う', () => {
    expect(parseCorrectedCount('-1').error).not.toBeNull()
    expect(parseCorrectedCount('1.5').error).not.toBeNull()
  })

  it('安全に扱えない大きな整数を拒否する', () => {
    expect(parseCorrectedCount('9007199254740992').error).toBe(
      '安全に扱える整数の範囲で入力してください。',
    )
  })
})

describe('createDemoRecord', () => {
  it('汎用デモ用のv2スキーマ情報を付与する', () => {
    expect(makeRecord()).toMatchObject({
      schemaVersion: 2,
      source: 'demo',
      productId: 'loquat',
      productLabel: 'びわ',
      varietyId: 'mogi',
      varietyLabel: '茂木',
      countUnit: 'pack',
      countUnitLabel: 'パック',
    })
  })

  it('商品・品種・単位を保存時の値で保持する', () => {
    expect(makeRecord({
      productId: 'kiwi',
      productLabel: '旧キウイ名',
      varietyId: 'hayward',
      varietyLabel: '旧ヘイワード名',
      countUnit: 'piece',
      countUnitLabel: '旧個数表記',
    })).toMatchObject({
      productId: 'kiwi',
      productLabel: '旧キウイ名',
      varietyId: 'hayward',
      varietyLabel: '旧ヘイワード名',
      countUnit: 'piece',
      countUnitLabel: '旧個数表記',
    })
  })

  it('記録日を作成日時と更新日時から独立して保持する', () => {
    const record = makeRecord({
      recordDate: '2026-06-30',
      createdAt: '2026-07-15T10:00:00.000Z',
      updatedAt: '2026-07-15T11:00:00.000Z',
      correctedCount: 10,
    })

    expect(record.recordDate).toBe('2026-06-30')
    expect(record.createdAt).toBe('2026-07-15T10:00:00.000Z')
    expect(record.updatedAt).toBe('2026-07-15T11:00:00.000Z')
    expect(record.finalCount).toBe(10)
  })

  it('更新日時を省略した場合は作成日時と同じ値にする', () => {
    const record = makeRecord()

    expect(record.updatedAt).toBe(record.createdAt)
  })

  it('修正値0を最終個数に採用する', () => {
    expect(makeRecord({ correctedCount: 0 }).finalCount).toBe(0)
  })
})

describe('validateRecordDetails', () => {
  it('店名と記録日を必須にする', () => {
    expect(validateRecordDetails({ storeName: '', recordDate: '' })).toEqual({
      storeName: '店名を入力してください。',
      recordDate: '記録日を入力してください。',
    })
  })

  it('空白だけの店名を拒否する', () => {
    expect(validateRecordDetails({
      storeName: '   ',
      recordDate: '2026-07-15',
    }).storeName).toBe('店名を入力してください。')
  })

  it('80文字を超える店名を拒否する', () => {
    expect(validateRecordDetails({
      storeName: '店'.repeat(81),
      recordDate: '2026-07-15',
    }).storeName).toBe('店名は80文字以内で入力してください。')
  })

  it('存在しない日付を拒否する', () => {
    expect(validateRecordDetails({
      storeName: '港店',
      recordDate: '2026-02-30',
    }).recordDate).toBe('正しい日付を入力してください。')
  })

  it('店名と実在する記録日があればエラーを返さない', () => {
    expect(
      validateRecordDetails({ storeName: '港店', recordDate: '2026-07-15' }),
    ).toEqual({ storeName: null, recordDate: null })
  })
})

describe('parseStoredDemoRecords', () => {
  it('保存データがなければ空の記録として扱う', () => {
    expect(parseStoredDemoRecords(null)).toEqual([])
  })

  it('壊れたJSONや配列以外は空の記録として扱う', () => {
    expect(parseStoredDemoRecords('{broken')).toEqual([])
    expect(parseStoredDemoRecords('{"id":"demo-1"}')).toEqual([])
  })

  it('びわ専用のv1記録をv2記録として混在させない', () => {
    expect(parseStoredDemoRecords(JSON.stringify([{
      ...makeRecord(),
      schemaVersion: 1,
      target: 'biwa',
    }]))).toEqual([])
  })


  it.each([
    'productId',
    'productLabel',
    'varietyId',
    'varietyLabel',
    'countUnit',
  ] as const)('v2記録の必須項目 %s が欠落・null・空白なら除外する', (field) => {
    for (const invalidValue of [undefined, null, '   ']) {
      const invalidRecord: Record<string, unknown> = { ...makeRecord() }
      if (invalidValue === undefined) delete invalidRecord[field]
      else invalidRecord[field] = invalidValue

      expect(parseStoredDemoRecords(JSON.stringify([invalidRecord]))).toEqual([])
    }
  })

  it.each([null, '', '   '])('単位表示名が %s なら除外する', (countUnitLabel) => {
    expect(parseStoredDemoRecords(JSON.stringify([{
      ...makeRecord(),
      countUnitLabel,
    }]))).toEqual([])
  })

  it('単位表示名のない旧v2記録は既知の単位コードから補完する', () => {
    const oldV2Record: Record<string, unknown> = { ...makeRecord() }
    delete oldV2Record.countUnitLabel

    expect(parseStoredDemoRecords(JSON.stringify([oldV2Record]))).toEqual([
      makeRecord(),
    ])
  })

  it('現在のマスタにない過去の商品・品種・単位もスナップショットから復元する', () => {
    const legacyRecord = {
      ...makeRecord(),
      productId: 'retired-product',
      productLabel: '旧商品',
      varietyId: 'retired-variety',
      varietyLabel: '旧品種',
      countUnit: 'bundle',
      countUnitLabel: '束',
    }

    expect(parseStoredDemoRecords(JSON.stringify([legacyRecord]))).toEqual([
      legacyRecord,
    ])
  })

  it('正しいデモ記録を復元する', () => {
    const record = makeRecord()

    expect(parseStoredDemoRecords(JSON.stringify([record]))).toEqual([record])
  })

  it('不正な要素を除外して正しいデモ記録だけを復元する', () => {
    const record = makeRecord()

    expect(
      parseStoredDemoRecords(JSON.stringify([{ id: 'broken' }, record])),
    ).toEqual([record])
  })

  it('作成日時の新しい順に並べて20件まで返す', () => {
    const records = Array.from({ length: 22 }, (_, index) => makeRecord({
      id: `demo-${index}`,
      createdAt: new Date(Date.UTC(2026, 6, 1, 0, 0, index)).toISOString(),
      updatedAt: new Date(Date.UTC(2026, 6, 1, 0, 0, index)).toISOString(),
    }))

    const parsed = parseStoredDemoRecords(JSON.stringify(records))

    expect(parsed).toHaveLength(20)
    expect(parsed[0]?.id).toBe('demo-21')
    expect(parsed[19]?.id).toBe('demo-2')
  })
})

describe('validateImageFile', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])(
    '%sを写真として受け付ける',
    (type) => {
      expect(validateImageFile({ type, size: 1024 })).toBeNull()
    },
  )

  it('写真以外のファイルを拒否する', () => {
    expect(validateImageFile({ type: 'application/pdf', size: 1024 })).toBe(
      'JPEG、PNG、WebPの画像を選択してください。',
    )
  })

  it('空の画像ファイルを拒否する', () => {
    expect(validateImageFile({ type: 'image/jpeg', size: 0 })).toBe(
      '空の画像ファイルは選択できません。',
    )
  })

  it('10MBちょうどの写真を受け付ける', () => {
    expect(
      validateImageFile({ type: 'image/jpeg', size: 10 * 1024 * 1024 }),
    ).toBeNull()
  })

  it('10MBを超える写真を拒否する', () => {
    expect(
      validateImageFile({ type: 'image/jpeg', size: 10 * 1024 * 1024 + 1 }),
    ).toBe('画像サイズは10MB以下にしてください。')
  })
})

describe('validateImageDimensions', () => {
  it('2500万画素以下の写真を受け付ける', () => {
    expect(validateImageDimensions({ width: 5000, height: 5000 })).toBeNull()
  })

  it('2500万画素を超える写真を拒否する', () => {
    expect(validateImageDimensions({ width: 5001, height: 5000 })).toBe(
      '画像の画素数が大きすぎます。2500万画素以下にしてください。',
    )
  })
})

describe('formatDateInputValue', () => {
  it('ローカル日付をdate入力用の形式にする', () => {
    expect(formatDateInputValue(new Date(2026, 6, 15, 23, 30))).toBe(
      '2026-07-15',
    )
  })
})
