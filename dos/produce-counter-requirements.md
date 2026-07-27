# produce-counter 要件

更新日: 2026-07-26

## 要件サマリ

`produce-counter` は、写真をアップロードし、AI による数量推定結果を確認・修正・保存するための Web アプリである。

初期リリースでは、AI 解析、認証、サーバー保存は本実装せず、先方確認用UIとAPIの最小構成を作る。

## 想定ユーザー

- 農産物の販売・出荷・記録作業を行う業務担当者
- 写真を元に販売数量を確認し、必要に応じて人間の判断で修正する人

## 初期画面要件

`apps/produce-counter/frontend` に以下を持つ写真アップロード画面を作る。

- 写真アップロード画面
- 商品、品種、カウント単位の選択
- 解析結果表示エリア
- 数量修正用の入力欄
- 店名と業務日付の入力
- 保存ボタン

初期対象は以下とする。

- びわ: 茂木、田中。既定単位はパック
- キウイ: ヘイワード、ゴールド。既定単位は個
- 栗: 筑波、銀寄。既定単位はパック
- 単位はパック、個、箱から人間が変更できる
- 商品または品種を変更した場合、既定単位へ切り替え、変更前の解析結果を無効化する

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
export type ProductId = 'loquat' | 'kiwi' | 'chestnut'
export type CountUnit = 'pack' | 'piece' | 'box'

export type CountRecord = {
  id: string
  productId: ProductId
  productLabel: string
  varietyId: string
  varietyLabel: string
  countUnit: CountUnit
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
```

`finalCount` は以下のルールで扱う。

- `correctedCount` があれば `correctedCount`
- なければ `estimatedCount`

## 拡張方針

- `productId`、`varietyId`、`countUnit` で対象を管理し、他の農産物にも拡張できるようにする
- 保存時点の商品名・品種名・単位表示名をスナップショットとして保持する
- 保存済みレコードは現在の商品・品種・単位マスタと照合せず、マスタ変更後も復元できるようにする
- AI 推定値と人間の修正値は分けて保存する
- `recordDate` は `createdAt`、`updatedAt` とは独立した業務日付として扱う
- API 型は `packages/shared` に置く
- 画像解析ロジックは `packages/vision` に分離する
