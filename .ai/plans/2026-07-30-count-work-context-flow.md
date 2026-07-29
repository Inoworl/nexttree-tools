# 卸先起点カウントフロー 実装計画

更新日: 2026-07-30

## ゴール

卸先と記録日を先に確定してから、品目・品種・数え方を選び、写真解析、数量修正、保存へ進む2ページの業務フローを構築する。

## 受け入れ条件

1. `/count/new` で卸先と記録日を選択しない限り、カウント作業を開始できない。
2. `/count/entry` は有効な `destinationId` と `recordDate` をURLから復元し、不正または不足した場合は `/count/new` へ戻す。
3. カウントページ上部に卸先名と記録日を常時表示し、変更操作を提供する。
4. カウントページの初期状態では品目が未選択で、品種、数え方、写真アップロードを利用できない。
5. 品目選択時に、その品目の先頭品種と既定単位を設定して写真アップロードを有効にする。
6. 商品設定を変更した場合は、設定変更前の解析結果と修正値を無効化する。
7. 保存記録は卸先ID、卸先名、業務日付、商品・品種・単位のIDと表示名をスナップショットとして保持する。
8. 保存成功後も卸先と記録日は維持し、「同じ卸先で次を登録」と「作業を終了」を選べる。
9. 未保存の写真または解析結果がある場合だけ、ページ離脱時に確認する。
10. 既存v2のブラウザ保存記録を失わず、店名を卸先名スナップショットとしてv3へ移行できる。
11. 320px以上のモバイルとデスクトップで、主要な操作や表示が重ならない。
12. Authentication、Firestore、Storage、実AI解析は今回の範囲に含めない。

## 設計判断

- 卸先は先方確認用のデモカタログとして `utils/destination-catalog.ts` に集約する。
- URLには変更可能な表示名を入れず、`destinationId` と `recordDate` のみを持たせる。
- 保存時にカタログから卸先名を解決し、履歴表示のためにIDと表示名の両方を保存する。
- 作業コンテキストの解析と検証は `utils/count-work-context.ts` の純粋関数に分離する。
- 共通ヘッダーとデザイントークンは `layouts/default.vue` に移し、`app.vue` はNuxtページの受け皿にする。
- 保存形式は `schemaVersion: 3`、localStorageキーは `nexttree:produce-counter:demo:v3` とする。
- v2記録は `storeName` を `destinationName` へ移し、`destinationId` は履歴用の `legacy` とする。
- 作業中判定は、未保存の写真、解析処理、解析結果、修正値のいずれかが存在する状態とする。

## Task 1: 作業コンテキストと保存形式の失敗テスト

- File: `apps/produce-counter/frontend/tests/count-work-context.test.ts`
- Action: 作成
- Details: 卸先解決、日付検証、クエリ生成、不正クエリ拒否をテストする。
- Acceptance: 実装前に対象テストが失敗する。
- Dependencies: なし

- File: `apps/produce-counter/frontend/tests/demo-record-storage.test.ts`
- Action: 変更
- Details: v3保存とv2からの移行を期待するテストへ更新する。
- Acceptance: v3未実装のためテストが失敗する。
- Dependencies: なし

## Task 2: 2ページUIフローの失敗テスト

- File: `apps/produce-counter/frontend/tests/count-new-page.test.ts`
- Action: 作成
- Details: 初期日付、必須入力、開始ボタン、遷移クエリをテストする。
- Acceptance: ページ未実装のためテストが失敗する。
- Dependencies: Task 1

- File: `apps/produce-counter/frontend/tests/count-entry-page.test.ts`
- Action: 作成
- Details: 不正URLの戻し、コンテキスト表示、品目未選択、写真無効、保存スナップショット、次件登録、終了、離脱確認をテストする。
- Acceptance: ページ未実装のためテストが失敗する。
- Dependencies: Task 1

## Task 3: コンテキストとデータモデル

- File: `apps/produce-counter/frontend/utils/destination-catalog.ts`
- Action: 作成
- Details: デモ卸先のID、表示名、検索関数を実装する。
- Acceptance: カタログテストが通る。
- Dependencies: Task 1

- File: `apps/produce-counter/frontend/utils/count-work-context.ts`
- Action: 作成
- Details: クエリ解析、日付検証、遷移先生成を実装する。
- Acceptance: コンテキストテストが通る。
- Dependencies: Task 1

- File: `packages/shared/src/index.ts`
- Action: 変更
- Details: `CountWorkContext` を追加し、`CountRecord` の店名を卸先ID・卸先名へ置き換える。
- Acceptance: workspaceの型検査とbuildが通る。
- Dependencies: なし

- File: `apps/produce-counter/frontend/utils/demo-counter.ts`
- Action: 変更
- Details: デモ記録をv3へ更新し、v2移行と卸先スナップショットを実装する。
- Acceptance: 保存形式テストが通る。
- Dependencies: Task 1

## Task 4: 共通レイアウトと作業開始ページ

- File: `apps/produce-counter/frontend/app.vue`
- Action: 変更
- Details: `NuxtLayout` と `NuxtPage` のみを持つ構成へ移行する。
- Acceptance: Nuxtの各ページを表示できる。
- Dependencies: Task 3

- File: `apps/produce-counter/frontend/layouts/default.vue`
- Action: 作成
- Details: ヘッダー、フッター、共通デザイントークン、共通フォーム・ボタンスタイルを実装する。
- Acceptance: 2ページで一貫したナビゲーションとスタイルになる。
- Dependencies: Task 3

- File: `apps/produce-counter/frontend/components/DestinationSelector.vue`
- Action: 作成
- Details: 卸先と業務日付の必須フォーム、エラー表示、フォーカス制御を実装する。
- Acceptance: キーボード操作とエラー読み上げが成立する。
- Dependencies: Task 3

- File: `apps/produce-counter/frontend/pages/count/new.vue`
- Action: 作成
- Details: 作業開始画面と `/count/entry` への遷移を実装する。
- Acceptance: 開始ページテストが通る。
- Dependencies: Task 3

## Task 5: カウントページ

- File: `apps/produce-counter/frontend/components/WorkContextHeader.vue`
- Action: 作成
- Details: 卸先名、記録日、変更リンクを常時表示する。
- Acceptance: コンテキストがページ上部で確認できる。
- Dependencies: Task 3

- File: `apps/produce-counter/frontend/components/CountRecordForm.vue`
- Action: 変更
- Details: 店名・日付入力を削除し、品目未選択、無効状態、保存後アクションに対応する。
- Acceptance: 選択順序と保存後操作のテストが通る。
- Dependencies: Task 2

- File: `apps/produce-counter/frontend/components/PhotoAnalysisPanel.vue`
- Action: 変更
- Details: 品目未選択時にファイル入力を無効化し、理由を表示する。
- Acceptance: 品目選択前に写真を選べない。
- Dependencies: Task 2

- File: `apps/produce-counter/frontend/pages/count/entry.vue`
- Action: 作成
- Details: 既存解析フローを移し、コンテキスト復元、保存、次件登録、離脱確認を実装する。
- Acceptance: カウントページテストが通る。
- Dependencies: Task 2, Task 3

- File: `apps/produce-counter/frontend/pages/index.vue`
- Action: 作成
- Details: ルートアクセスを `/count/new` へ置き換える。
- Acceptance: Hostingのルートから作業開始ページへ到達できる。
- Dependencies: Task 4

## Task 6: 仕様更新と検証

- File: `dos/produce-counter-requirements.md`
- Action: 変更
- Details: 卸先起点の2ページフローとv3保存モデルを一次仕様へ反映する。
- Acceptance: 実装と仕様に矛盾がない。
- Dependencies: Task 3, Task 5

- File: `.ai/requirements.md`
- Action: 変更
- Details: 店名直接入力を卸先選択へ更新する。
- Acceptance: AI向け要件が一次仕様を参照できる。
- Dependencies: Task 6

- Action: Dockerで依存取得、対象テスト、全テスト、typecheck、build、generateを実行する。
- Acceptance: すべて終了コード0になる。
- Dependencies: Task 1-6

- Action: `http://localhost:13700` をモバイルとデスクトップで操作・表示確認する。
- Acceptance: 遷移、解析、保存、ガード、レスポンシブ表示に問題がない。
- Dependencies: Docker検証

- Action: dev Firebase Hostingを更新し、commit、push、PR作成を行う。
- Acceptance: dev URLで新フローを確認でき、`dev` 向けPRが作成される。
- Dependencies: 全検証
