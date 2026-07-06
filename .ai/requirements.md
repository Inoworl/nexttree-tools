# AIエージェント用 要件参照

更新日: 2026-07-06

## このファイルの位置づけ

このファイルは AIエージェントが開発開始時に最初に確認する要件インデックスである。

業務・アプリ仕様の本文は `dos/` に置く。ここでは、開発時に迷いやすい要点と参照先のみをまとめる。

## 参照すべき仕様

- プロジェクト全体: `dos/project-spec.md`
- `biwa-counter` 要件: `dos/biwa-counter-requirements.md`
- アーキテクチャ: `dos/architecture.md`
- 設計判断: `dos/decisions.md`

## 初期実装で満たすこと

- pnpm workspace によるモノレポを作る
- `apps/biwa-counter/frontend` で Nuxt 3 を起動できる
- `apps/biwa-counter/backend` で Hono API を起動できる
- `GET /api/health` が `{ "status": "ok" }` を返す
- `packages/shared` に共通型を置く
- `packages/vision` を画像解析ロジックの置き場として作る
- 画像アップロード画面の仮UIを作る
- `.env.example` を作る
- `README.md` にセットアップ手順を書く

## 初期実装でやらないこと

- 本番デプロイ
- 認証実装
- Firestore 保存
- Storage 保存
- AI 解析の本実装
- 管理画面
- 決済
- 高度な権限管理
- びわ以外の対象追加

## 注意

`finalCount` の扱いは `dos/biwa-counter-requirements.md` に従う。

- `correctedCount` があれば `correctedCount`
- なければ `estimatedCount`

