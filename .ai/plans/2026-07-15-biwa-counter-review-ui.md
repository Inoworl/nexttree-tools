# biwa-counter 先方確認用 UI 実装方針

更新日: 2026-07-15

## 1. ゴール

先方が、写真の選択からデモ解析、AI 推定結果の確認、人間による個数修正、店名と記録日の入力、保存結果の確認までを一続きに操作できる UI プロトタイプを作る。

このプロトタイプは業務フローと画面構成の合意形成に使う。実際の AI、Backend API、Firebase には接続しない。

## 2. 対象範囲

- 10MB 以下の JPEG / PNG / WebP 写真の選択とプレビュー
- デモ解析中、解析完了、入力エラー、保存成功、保存失敗の状態
- 割合座標による 9 件のデモ検出枠
- デモ推定数、修正数、最終数の分離
- 店名と記録日の入力
- `recordDate`、`createdAt`、`updatedAt` の独立保持
- `localStorage` へのメタデータ保存
- 最近の記録の表示と再読込後の復元
- モバイルとデスクトップのレスポンシブ表示
- キーボード操作、入力ラベル、エラー関連付け、動的通知

## 3. 対象外

- 実際の画像認識と赤枠位置の正確性
- AI プロバイダーとの通信
- Backend API
- Firebase Authentication / Firestore / Storage
- 画像、base64、Blob URL の永続化
- 本番データモデルの確定
- 記録の編集・削除
- コミット、push、PR 作成

## 4. デモ境界

画面上に次を明示する。

- UI 確認用デモである
- 表示する赤枠と推定数は固定のデモ結果である
- API や Firebase へ送信しない
- 写真は保存しない
- 記録メタデータは現在のブラウザだけに保存する

本番の `CountRecord` は変更しない。今回の保存形式は `DemoCountRecord` として frontend 内に閉じ、共有するのは `resolveFinalCount` の業務ルールだけとする。

## 5. データ方針

### 5.1 デモ記録

```ts
export type DemoCountRecord = {
  schemaVersion: 1
  source: 'demo'
  id: string
  target: 'biwa'
  fileName: string
  storeName: string
  recordDate: string
  estimatedCount: number
  correctedCount: number | null
  finalCount: number
  createdAt: string
  updatedAt: string
}
```

- `recordDate`: 業務上の記録日。`YYYY-MM-DD` の文字列として保持する。
- `createdAt`: デモ記録を最初に保存した日時。
- `updatedAt`: デモ記録を最後に更新した日時。今回は編集機能がないため作成時は `createdAt` と同値になる。
- `recordDate` を `createdAt` や `updatedAt` から導出しない。
- `finalCount` は `correctedCount ?? estimatedCount` とする。修正値 `0` も有効とする。

### 5.2 localStorage

- キー: `nexttree:biwa-counter:demo:v1`
- 保存件数: 新しい順で最大 20 件
- 保存対象: デモ記録のメタデータのみ
- 保存しないもの: 写真、Data URL、Blob URL、検出枠
- 読込時はレコード単位でランタイム検証し、不正な要素を除外する。
- `getItem`、`setItem`、JSON parse を `try/catch` し、失敗時に保存成功を表示しない。
- SSR 中はアクセスせず、`onMounted` 以降に復元する。

## 6. 画面状態

| 状態 | 入口 | 表示 | 操作 |
| --- | --- | --- | --- |
| 初期 | 初回表示 | 写真未選択、最近の記録 | 写真選択のみ |
| 写真選択済み | 有効な写真を選択 | プレビュー、ファイル情報 | 再選択、解析 |
| 写真エラー | 無効な形式・容量・画素数 | 入力直下のエラー | 再選択 |
| 解析中 | 解析ボタン | 静的な処理中表示 | 二重実行不可 |
| 解析済み | デモ解析完了 | 9 枠、推定数、修正欄 | 修正、記録情報入力、保存 |
| 入力エラー | 不正な修正数・店名・日付 | 各入力直下のエラー | 修正後に再保存 |
| 保存成功 | 有効な入力で保存 | 完了通知、最近の記録先頭へ追加 | 続けて確認可能 |
| 保存失敗 | localStorage 利用不可・容量超過 | 保存操作の近くにエラー | 入力を保持して再試行 |

新しい写真を選んだ場合は、前の解析結果、修正数、保存メッセージを破棄する。店名と記録日は連続入力を考慮して保持する。

## 7. UI 構成

### 7.1 情報階層

1. ページヘッダー: `biwa-counter`、デモ表示
2. 写真・解析領域: 写真選択、プレビュー、検出枠、解析状態
3. 結果・記録領域: 推定数、修正数、最終数、店名、記録日、保存
4. 最近の記録: 記録日、店名、推定数、修正数、最終数、ファイル名

デスクトップは写真領域と入力領域を 2 カラム、モバイルは 1 カラムにする。最近の記録は常に下部全幅とする。カードの入れ子は作らず、セクションを罫線と余白で分ける。

### 7.2 コンポーネント境界

| ファイル | 責務 |
| --- | --- |
| `apps/biwa-counter/frontend/app.vue` | 状態の接続、Object URL のライフサイクル、解析・保存イベント |
| `components/PhotoAnalysisPanel.vue` | 写真入力、プレビュー、赤枠、解析状態 |
| `components/CountRecordForm.vue` | 推定数、修正数、最終数、店名、記録日、保存 |
| `components/RecentRecords.vue` | 空状態と最近の記録一覧 |
| `composables/useDemoRecords.ts` | localStorage の読込・保存・件数制限・失敗状態 |
| `utils/demo-counter.ts` | 純粋な生成、検証、日付、保存データ解析 |
| `utils/demo-record-storage.ts` | localStorage 境界の読込・保存と例外処理 |
| `tests/demo-counter.test.ts` | 純粋ロジックのユニットテスト |
| `tests/demo-record-storage.test.ts` | ストレージ境界のユニットテスト |

### 7.3 検出枠

- 画像と検出枠を同じ `position: relative` の座標面に置く。
- 画像は自然アスペクト比で表示し、枠を `%` 座標で配置する。
- `object-fit` による余白が座標面へ入らない構造にする。
- 枠は赤線、白い外周、番号を併用し、赤色だけに依存しない。
- 枠は非操作要素として `aria-hidden="true"` にし、件数はテキストで通知する。

### 7.4 ビジュアル方針

- 農業現場向けの静かで作業中心の画面とする。
- 白・薄いグレーを基調に、操作アクセントは緑、検出だけ赤を使う。
- グラデーション、装飾的なカード、過剰な角丸、発光表現を使わない。
- 見出しは画面規模に合わせ、数値には tabular numbers を使う。
- JavaScript アニメーションは使わない。解析中は静的な構造表示と状態文で伝える。
- アイコンが必要なボタンでは `@lucide/vue` を使用する。

## 8. アクセシビリティ方針

- `main`、`section`、一意な `h1`、順序どおりの `h2` を使う。
- すべての入力に常時表示の `label` を付ける。
- 必須入力には `required`、エラー時には `aria-invalid` を設定する。
- エラーと補足を `aria-describedby` で入力へ関連付ける。
- 解析結果と保存結果は `aria-live="polite"` で通知する。
- 写真選択、解析、修正、保存をキーボードだけで完了できる。
- フォーカス順を視覚順と一致させ、明瞭な `:focus-visible` を表示する。
- 保存時の入力エラーでは最初の不正項目へフォーカスする。
- 通常文字 4.5:1、UI 境界とフォーカス 3:1 以上を目標とする。
- 320px 幅、200% 以上の拡大でも横スクロール、重なり、文字欠落を起こさない。

## 9. Sub-agent 運用方針

### 実装前

- UI 設計担当: 情報階層、状態遷移、レスポンシブ、アクセシビリティを読み取り専用で確認する。
- テスト担当: 受け入れ条件をユニット・ビルド・ブラウザ検証へ対応付ける。
- PMO 担当: セキュリティ、性能、保守性、デモ境界を読み取り専用で確認する。

### 実装中

- メインエージェントが全ファイルを編集し、状態管理と差分を統合する。
- Sub-agent に同一ファイルを並列編集させない。
- 独立したレビューが必要な場合だけ、読み取り専用で再委譲する。

### 実装後

- コードレビュー担当: 差分から Critical / Warning / Suggestion を提示する。
- PMO 担当: 受け入れ条件と検証証跡を照合し、PASS / FAIL / WARN を返す。
- 指摘修正はメインエージェントが行い、修正後に全検証を再実行する。

## 10. 受け入れ条件とテスト対応

| 受け入れ条件 | ユニットテスト | ブラウザ検証 |
| --- | --- | --- |
| JPEG / PNG / WebP を選択できる | MIME、0 byte、10MB 境界 | 選択とプレビュー |
| 無効画像を拒否する | MIME、容量、画素数 | 入力直下のエラー |
| デモ解析状態を表示する | 解析結果生成 | ボタン、解析中、完了 |
| 赤枠数と推定数が一致する | 件数、座標、ID 一意性 | DOM 枠数と表示値 |
| 修正値を扱う | 空欄、0、整数、負数、小数、安全整数超過 | 入力エラーと最終数 |
| 店名と記録日が必須 | 空、空白、日付形式、実在日 | フォーカスとエラー関連付け |
| 記録日が作成・更新日時と独立する | 異なる値を保存・復元 | localStorage 内容 |
| メタデータだけ保存する | シリアライズ対象 | localStorage に画像がない |
| 壊れた保存データを安全に扱う | null、非配列、欠損、混在配列 | 再読込で画面が壊れない |
| 最近の記録を新しい順で表示する | 並び順、20件上限 | 2件保存、再読込復元 |
| モバイルと PC で利用できる | 対象外 | 390x844、1440x900 |
| キーボードだけで操作できる | 対象外 | Tab、Shift+Tab、Enter、Space |
| API / Firebase 通信がない | 対象外 | Network 確認 |

## 11. 実装タスク

### Task 1: テスト実行を決定的にする

- File: `apps/biwa-counter/frontend/package.json`
- Action: modify
- Details:
  - `test` を `vitest run --no-cache` にする。
  - Docker bind mount直後でも変換キャッシュを合否判定へ使わない。
- Acceptance:
  - export 追加直後のテストが古いモジュールを参照しない。
- Dependencies: なし

### Task 2: 純粋ロジックの受け入れテストを完成する

- File: `apps/biwa-counter/frontend/tests/demo-counter.test.ts`
- Action: modify
- Details:
  - 正常画像、0 byte、10MB 境界、許可 MIME を追加する。
  - 検出枠が空でないこと、ID が一意であることを追加する。
  - 修正値 `0`、空白、安全整数超過を追加する。
  - 実在日、店名空白、店名最大長を追加する。
  - 保存データの正常、非配列、欠損、混在、20件上限を追加する。
  - `recordDate`、`createdAt`、`updatedAt` の独立を追加する。
- Acceptance:
  - 新規ケースが実装前に RED になり、実装後に GREEN になる。
- Dependencies: Task 1

### Task 3: デモロジックを堅牢化する

- File: `apps/biwa-counter/frontend/utils/demo-counter.ts`
- Action: modify
- Details:
  - `DemoCountRecord` にスキーマ・source・target・updatedAtを追加する。
  - 許可 MIME、容量、0 byte、画素数を検証する。
  - 修正数に `Number.isSafeInteger` を適用する。
  - 記録日の形式と実在日、店名の trim と最大長を検証する。
  - localStorage のレコード単位検証、並び順、20件上限を実装する。
- Acceptance:
  - Task 2 の全テストが GREEN になる。
- Dependencies: Task 2

### Task 4: デモ保存を実装する

- File:
  - `apps/biwa-counter/frontend/utils/demo-record-storage.ts`
  - `apps/biwa-counter/frontend/tests/demo-record-storage.test.ts`
  - `apps/biwa-counter/frontend/composables/useDemoRecords.ts`
- Action: create
- Details:
  - ストレージ境界を注入可能な純粋関数として先にテストする。
  - `onMounted` 後の復元、例外処理、保存、先頭追加を実装する。
  - 保存失敗時は既存記録と入力状態を壊さない。
- Acceptance:
  - 保存、再読込、破損データ、容量エラーをブラウザで確認できる。
- Dependencies: Task 3

### Task 5: 写真・解析パネルを実装する

- File: `apps/biwa-counter/frontend/components/PhotoAnalysisPanel.vue`
- Action: create
- Details:
  - native file input、プレビュー、解析ボタン、静的な解析中状態、検出枠を実装する。
  - 検出枠と画像を同一座標面に置く。
- Acceptance:
  - 画像選択から9枠表示までキーボードで操作できる。
- Dependencies: Task 3

### Task 6: 記録フォームを実装する

- File: `apps/biwa-counter/frontend/components/CountRecordForm.vue`
- Action: create
- Details:
  - 推定数、修正数、最終数、店名、記録日、保存操作を実装する。
  - フィールド別エラーと最初のエラーへのフォーカスを実装する。
- Acceptance:
  - 修正値と必須項目の全状態を操作できる。
- Dependencies: Task 3

### Task 7: 最近の記録を実装する

- File: `apps/biwa-counter/frontend/components/RecentRecords.vue`
- Action: create
- Details:
  - 空状態と最大20件の一覧を実装する。
  - `article` と `dl` を使い、単一DOMをレスポンシブ化する。
- Acceptance:
  - 新しい記録が先頭に表示され、再読込後も復元される。
- Dependencies: Task 4

### Task 8: 画面を統合する

- File: `apps/biwa-counter/frontend/app.vue`
- Action: modify
- Details:
  - 各コンポーネントと状態を接続する。
  - Object URL を差し替え、削除、unmount の全経路で revoke する。
  - デモ境界と必須注意文を表示する。
  - 写真交換時の古い解析結果反映を防ぐ。
- Acceptance:
  - 受け入れフローを最初から最後まで操作できる。
- Dependencies: Task 4-7

### Task 9: UI 依存関係とビジュアルを整える

- File:
  - `apps/biwa-counter/frontend/package.json`
  - `pnpm-lock.yaml`
  - Task 5-8 の Vue ファイル
- Action: modify
- Details:
  - `@lucide/vue` を追加する。
  - CSS変数で色、余白、境界、フォーカスを統一する。
  - 320pxからデスクトップまで安定するレイアウトを作る。
- Acceptance:
  - 390x844と1440x900で重なり、欠落、横スクロールがない。
- Dependencies: Task 5-8

### Task 10: 自動検証を実行する

- File: 変更なし
- Action: verify
- Details:
  - Docker内でテスト、build、再テストを実行する。
  - `git diff --check` と機密ファイル混入確認を行う。
- Acceptance:
  - 全コマンドが終了コード0になる。
- Dependencies: Task 1-9

### Task 11: ブラウザ受け入れ検証を実行する

- File: 変更なし
- Action: verify
- Details:
  - `http://localhost:13700` でデスクトップとモバイルを確認する。
  - 固定fixture画像で全フロー、再読込、キーボード、Network、アクセシビリティを確認する。
- Acceptance:
  - 受け入れ条件のブラウザ列がすべてPASSになる。
- Dependencies: Task 10

### Task 12: 独立レビューと最終判定を行う

- File: 変更なし
- Action: review
- Details:
  - Sub-agentへコードレビューとPMO判定を読み取り専用で委譲する。
  - Critical / Warningを修正し、全検証を再実行する。
- Acceptance:
  - Critical 0件、PMO判定PASS、未検証項目0件になる。
- Dependencies: Task 11

## 12. 検証コマンド

ホストにpnpmがないため、Docker Composeを正とする。

```bash
docker compose -f docker/compose/docker-compose.dev.yml --profile app run --rm deps
docker compose -f docker/compose/docker-compose.dev.yml --profile app run --rm --no-deps frontend corepack pnpm test
docker compose -f docker/compose/docker-compose.dev.yml --profile app run --rm --no-deps frontend corepack pnpm build
docker compose -f docker/compose/docker-compose.dev.yml --profile app up -d frontend
```

ブラウザ確認URL:

- Frontend: `http://localhost:13700`

## 13. 完了条件

- ユニットテストがすべて成功する。
- Nuxt build が成功する。
- デスクトップとモバイルの全フローが成功する。
- キーボードだけで主要操作を完了できる。
- 重大なアクセシビリティ指摘がない。
- Network上でAPI/Firebase通信が発生しない。
- localStorageに画像やBlob URLが保存されない。
- `recordDate`、`createdAt`、`updatedAt`が独立している。
- Object URLが全終了経路で破棄される。
- Sub-agentのコードレビューでCriticalが0件になる。
- PMOの最終判定がPASSになる。
- 差分に機密情報と無関係な変更がない。
