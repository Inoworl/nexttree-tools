import type { CountConfiguration } from '@nexttree/shared'

/**
 * 画像解析の入力。初期段階では画像バイナリの受け渡し方法のみ定義する。
 */
export type AnalyzeCountInput = CountConfiguration & {
  image: Uint8Array
}

/**
 * 画像解析の結果。AI 推定値のみを返し、修正値は扱わない。
 */
export type AnalyzeCountResult = CountConfiguration & {
  estimatedCount: number
}

/**
 * 画像から個数を推定するアナライザーの抽象。
 * 本実装(外部 AI プロバイダ連携)は将来ここに追加する。
 */
export type CountAnalyzer = {
  analyze(input: AnalyzeCountInput): Promise<AnalyzeCountResult>
}

/**
 * 未実装のプレースホルダー。呼び出すと必ずエラーを投げる。
 */
export function createUnimplementedAnalyzer(): CountAnalyzer {
  return {
    analyze() {
      return Promise.reject(
        new Error('AI 解析は未実装です。packages/vision に本実装を追加してください。'),
      )
    },
  }
}
