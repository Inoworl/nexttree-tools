# produce-counter 汎用化 実装計画

更新日: 2026-07-26

## ゴール

既存のびわ専用デモを、びわ・キウイ・栗の商品、品種、カウント単位を選択して同じ確認・修正・保存フローを使える `produce-counter` へ汎用化する。

## 受け入れ条件

1. アプリ名、ディレクトリ、package、Docker、Hosting target が `produce-counter` に統一される。
2. UIで、びわ・キウイ・栗の商品を選択できる。
3. 商品ごとに品種を選択でき、各品種が既定カウント単位を持つ。
4. カウント単位はパック・個・箱から記録単位として上書きできる。
5. びわの初期選択は「茂木」、初期単位は「パック」になる。
6. 商品・品種・単位の変更時は、単位の異なる解析結果を再利用せず解析前へ戻る。
7. 推定値、修正値、保存結果は同じ単位表記を使う。
8. 保存レコードは `productId`、`varietyId`、`countUnit` を保持し、マスタ変更の影響を受けない。
9. localStorageは `nexttree:produce-counter:demo:v2` を使い、v1のびわ専用データと混在しない。
10. dev Hostingでデスクトップ・モバイルの主要フローを確認できる。

## 対象外

- Firestore、Authentication、Storageの作成
- 実際のAI画像解析
- prod Hostingへのデプロイ
- 過去の実装計画やマージ済みPR履歴の書き換え

## 実装タスク

### Task 1: 商品・品種・単位モデル

- File: `packages/shared/src/index.ts`
- File: `apps/produce-counter/frontend/utils/demo-counter.ts`
- Action: 商品マスタ、単位型、v2保存レコード、表示ラベル取得を追加する。
- Acceptance: 商品ごとの品種と既定単位、レコードのスナップショットをユニットテストで確認できる。

### Task 2: UI選択と動的単位

- File: `apps/produce-counter/frontend/app.vue`
- File: `apps/produce-counter/frontend/components/CountRecordForm.vue`
- File: `apps/produce-counter/frontend/components/PhotoAnalysisPanel.vue`
- File: `apps/produce-counter/frontend/components/RecentRecords.vue`
- Action: 商品、品種、単位の選択と動的表示を追加する。
- Acceptance: 選択変更で解析結果がリセットされ、保存一覧に商品・品種・単位が表示される。

### Task 3: アプリ識別子の汎用化

- Move: `apps/biwa-counter` -> `apps/produce-counter`
- Action: package名、Docker working directory、localStorage key、入力ID、ログ、検出IDを汎用名へ変更する。
- Acceptance: 現行コードにアプリ識別子としての `biwa-counter` が残らない。

### Task 4: Hostingとドキュメント

- File: `firebase-commons/firebase.json`
- File: `firebase-commons/.firebaserc.example`
- File: `firebase-commons/README.md`
- File: `README.md`
- File: `AGENTS.md`
- File: `dos/*.md`
- Action: 現行構成と手順を `produce-counter` に更新する。
- Acceptance: Docker生成、Hosting Emulator、dev deployが新しいtargetで成功する。

### Task 5: 検証とPR

- Dockerで全テスト、workspace build、Hosting生成を実行する。
- Playwrightで1440x900と390x844の主要フロー、横はみ出し、consoleを確認する。
- dev Hostingだけへデプロイする。
- コミット、push、PR作成まで行う。
