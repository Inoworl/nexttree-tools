/**
 * カウント対象。農産物・商品を追加する場合はここへIDを追加する。
 */
export type ProductId = 'loquat' | 'kiwi' | 'chestnut'

/**
 * 解析・修正・保存を通して使うカウント単位。
 */
export type CountUnit = 'pack' | 'piece' | 'box'

/**
 * 1回のカウント記録。AI 推定値と人間の修正値は分けて保持する。
 */
export type CountConfiguration = {
  productId: ProductId
  varietyId: string
  countUnit: CountUnit
}

export type CountRecord = CountConfiguration & {
  id: string
  productLabel: string
  varietyLabel: string
  countUnitLabel: string
  imageUrl: string
  storeName: string
  recordDate: string
  estimatedCount: number
  correctedCount: number | null
  finalCount: number
  memo: string | null
  createdAt: string
  updatedAt: string
}

export type HealthResponse = {
  status: 'ok'
}

/**
 * finalCount のルール: correctedCount があれば correctedCount、なければ estimatedCount。
 */
export function resolveFinalCount(
  estimatedCount: number,
  correctedCount: number | null,
): number {
  return correctedCount ?? estimatedCount
}
