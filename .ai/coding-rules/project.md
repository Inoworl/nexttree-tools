# nexttree-tools コーディングルール

更新日: 2026-07-06

## 原則

- シンプルに実装する
- 可読性を優先する
- 単一責務を守る
- エラー処理を省略しない
- 共有型は `packages/shared` に集約する
- 画像解析の責務は `packages/vision` に分離する

## Frontend

- Nuxt 3 を使う
- 初期UIは仮実装でよいが、業務フローが分かる構成にする
- 注意文「AIによる推定結果です。必要に応じて修正してください。」を表示する
- API Base URL は `NUXT_PUBLIC_API_BASE_URL` を使う

## Backend

- Hono + TypeScript を使う
- Cloud Run 前提で `PORT` 環境変数を見る
- 初期APIは `GET /api/health` のみにする
- 業務ロジックは Firebase ではなく backend に寄せる

## Data Model

- `estimatedCount` と `correctedCount` を分ける
- `finalCount` は `correctedCount ?? estimatedCount` として扱う
- カウント対象は `target` で管理する

## Tests

- 主要機能にはユニットテストを追加する
- 初期段階では health check と shared 型の利用箇所を優先する
- エッジケースは、保存・AI解析の本実装時に追加する

