/**
 * カウント対象。びわ以外の農産物・商品に拡張する場合はここへ追加する。
 */
export type CountTarget = 'biwa'

/**
 * 1回のカウント記録。AI 推定値と人間の修正値は分けて保持する。
 */
export type CountRecord = {
  id: string
  target: CountTarget
  imageUrl: string
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
