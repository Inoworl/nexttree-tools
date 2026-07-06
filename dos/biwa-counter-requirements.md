# biwa-counter 要件

更新日: 2026-07-06

## 要件サマリ

`biwa-counter` は、写真をアップロードし、AI による個数推定結果を確認・修正・保存するための Web アプリである。

初期リリースでは、AI 解析、認証、保存処理は本実装せず、画面とAPIの最小構成を作る。

## 想定ユーザー

- びわの販売・出荷・記録作業を行う業務担当者
- 写真を元に販売個数を確認し、必要に応じて人間の判断で修正する人

## 初期画面要件

`apps/biwa-counter/frontend` に以下を持つ写真アップロード画面を作る。

- 写真アップロード画面
- 解析結果表示エリア
- 個数修正用の入力欄
- 保存ボタン

画面には以下の注意文を表示する。

> AIによる推定結果です。必要に応じて修正してください。

## 初期API要件

### GET /api/health

ヘルスチェック用API。

レスポンス:

```json
{
  "status": "ok"
}
```

## 将来的に作るAPI

- `POST /api/images`
- `POST /api/counts/analyze`
- `POST /api/counts`
- `GET /api/counts`
- `GET /api/counts/:id`
- `PATCH /api/counts/:id`

## データモデル案

```ts
export type CountTarget = 'biwa'

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
```

`finalCount` は以下のルールで扱う。

- `correctedCount` があれば `correctedCount`
- なければ `estimatedCount`

## 拡張方針

- `target` でカウント対象を管理し、びわ以外にも拡張できるようにする
- AI 推定値と人間の修正値は分けて保存する
- API 型は `packages/shared` に置く
- 画像解析ロジックは `packages/vision` に分離する

