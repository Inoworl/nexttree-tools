# 初期実装計画

更新日: 2026-07-06

## ゴール

`nexttree-tools` を pnpm workspace のモノレポとして初期化し、`biwa-counter` の Nuxt frontend と Hono backend がローカルで起動できる最小構成を作る。

## 実装範囲

- モノレポ初期化
- Nuxt frontend の最小構成
- Hono backend の最小構成
- `GET /api/health`
- shared 型定義
- 画像アップロード画面の仮UI
- `.env.example`
- `firebase-commons`
- `README.md`

## 実装しない範囲

- AI 解析の本実装
- Firebase Authentication 実装
- Firestore 保存
- Storage 保存
- Cloud Run 本番デプロイ
- 管理画面
- 決済
- 高度な権限管理

## Task 1: workspace 基盤を作る

- File: `package.json`
- Action: create
- Details:
  - `private: true`
  - `packageManager: pnpm`
  - `scripts.dev` で frontend と backend を同時起動できるようにする
- Acceptance:
  - `pnpm install` が実行できる
  - `pnpm dev` の入口が存在する
- Dependencies: なし

## Task 2: pnpm workspace を定義する

- File: `pnpm-workspace.yaml`
- Action: create
- Details:
  - `apps/*/*`
  - `apps/*`
  - `packages/*`
- Acceptance:
  - `apps/biwa-counter/frontend`
  - `apps/biwa-counter/backend`
  - `packages/shared`
  - `packages/ui`
  - `packages/vision`
  が workspace として認識される
- Dependencies: Task 1

## Task 3: shared package を作る

- File:
  - `packages/shared/package.json`
  - `packages/shared/src/index.ts`
- Action: create
- Details:
  - `CountTarget`
  - `CountRecord`
  - `HealthResponse`
- Acceptance:
  - frontend/backend から型を import できる構成になっている
- Dependencies: Task 2

## Task 4: vision package を作る

- File:
  - `packages/vision/package.json`
  - `packages/vision/src/index.ts`
- Action: create
- Details:
  - AI 解析の本実装はしない
  - 将来の画像解析用の置き場として最小 export を用意する
- Acceptance:
  - backend から依存追加できる
- Dependencies: Task 2

## Task 5: Hono backend を作る

- File:
  - `apps/biwa-counter/backend/package.json`
  - `apps/biwa-counter/backend/src/index.ts`
  - `apps/biwa-counter/backend/tsconfig.json`
- Action: create
- Details:
  - `GET /api/health` を実装
  - `PORT=8787` をデフォルトにする
  - Cloud Run 前提で環境変数 `PORT` を見る
- Acceptance:
  - `http://localhost:8787/api/health` が `{ "status": "ok" }` を返す
- Dependencies: Task 3

## Task 6: Nuxt frontend を作る

- File:
  - `apps/biwa-counter/frontend/package.json`
  - `apps/biwa-counter/frontend/nuxt.config.ts`
  - `apps/biwa-counter/frontend/app.vue`
- Action: create
- Details:
  - 写真アップロード画面
  - 解析結果表示エリア
  - 個数修正用の入力欄
  - 保存ボタン
  - 注意文「AIによる推定結果です。必要に応じて修正してください。」を表示
- Acceptance:
  - `http://localhost:3000` で画面が表示される
- Dependencies: Task 3

## Task 7: 環境変数サンプルを作る

- File: `.env.example`
- Action: create
- Details:
  - 指示書の内容どおりに作成する
- Acceptance:
  - 開発者が必要な環境変数を把握できる
- Dependencies: なし

## Task 8: README を作る

- File: `README.md`
- Action: create
- Details:
  - プロジェクト概要
  - ディレクトリ構成
  - セットアップ手順
  - 起動コマンド
  - 初期実装範囲
  - 未実装範囲
- Acceptance:
  - 初回開発者が `pnpm install` と `pnpm dev` まで進められる
- Dependencies: Task 1-7

## Task 9: Firebase 共通設定置き場を作る

- File:
  - `firebase-commons/README.md`
  - `firebase-commons/.firebaserc.example`
  - `firebase-commons/.gitignore`
  - `firebase-commons/config/dev/.gitkeep`
  - `firebase-commons/config/prod/.gitkeep`
- Action: create
- Details:
  - Firebase Hosting、Authentication、Firestore、Storage / Cloud Storage の共通設定置き場を作る
  - 実際の `.firebaserc`、`.env`、サービスアカウントキーはコミット対象にしない
  - `dev` / `prod` の環境別ディレクトリを用意する
- Acceptance:
  - Firebase 関連設定の置き場がアプリ本体と分離されている
  - 秘密情報を含む実値ファイルが `.gitignore` で除外されている
- Dependencies: なし

## 検証チェックポイント

1. `pnpm install`
2. `pnpm dev`
3. `GET http://localhost:8787/api/health`
4. `http://localhost:3000` の画面表示
5. `firebase-commons/` に実値や秘密情報が含まれていないこと
