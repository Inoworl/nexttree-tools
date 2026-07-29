# produce-counter 要件

更新日: 2026-07-30

## 要件サマリ

`produce-counter` は、写真をアップロードし、AI による数量推定結果を確認・修正・保存するための Web アプリである。

初期リリースでは、AI 解析、認証、サーバー保存は本実装せず、先方確認用UIとAPIの最小構成を作る。

## 想定ユーザー

- 農産物の販売・出荷・記録作業を行う業務担当者
- 写真を元に販売数量を確認し、必要に応じて人間の判断で修正する人

## 作業フロー

### 1. 作業開始

`/count/new` で、今回の記録に使う卸先と業務日付を選択する。

- 卸先と業務日付は必須とする
- 業務日付の初期値は当日とする
- 商品はこの画面では選択しない
- 有効な卸先と日付が揃うまでカウント作業を開始できない
- 業務日付は `createdAt`、`updatedAt` から独立した日付とする

### 2. カウント入力

`/count/entry` で、作業開始時に選んだ卸先と業務日付を表示しながら、商品ごとのカウントを行う。

- URLには `destinationId` と `recordDate` を保持し、再読込時に作業情報を復元する
- 不正または不足した作業情報では `/count/new` へ戻す
- 初期状態では商品を未選択とし、品種、カウント単位、写真アップロードを無効にする
- 商品選択時に先頭品種と既定カウント単位を設定する
- 作業中は卸先名と業務日付を画面上部に表示する
- 写真アップロード、デモ解析、赤枠表示、人間による数量修正、保存を行う
- 未保存の写真または解析結果がある場合だけ、ページ離脱時に確認する
- 保存後は卸先と業務日付を維持し、同じ卸先で次の商品を登録できる
- 作業終了時は `/count/new` へ戻る

卸先は初期段階ではUI確認用のデモカタログから選択する。卸先マスタの管理機能は今回実装しない。

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
  destinationId: string
  destinationName: string
  productId: ProductId
  productLabel: string
  varietyId: string
  varietyLabel: string
  countUnit: CountUnit
  countUnitLabel: string
  imageUrl: string
  recordDate: string
  estimatedCount: number
  correctedCount: number | null
  finalCount: number
  memo: string | null
  createdAt: string
  updatedAt: string
}
```

`destinationName`、`productLabel`、`varietyLabel`、`countUnitLabel` は保存時の表示名をスナップショットとして保持する。

ブラウザ保存形式は `schemaVersion: 3` とする。旧 `schemaVersion: 2` の `storeName` は、読込時に履歴用の `destinationName` へ移行する。

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
