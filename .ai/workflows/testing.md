# Testing Workflow

更新日: 2026-07-06

## 目的

変更範囲に合った検証を行い、完了報告に根拠を持たせる。

## 初期検証候補

```bash
pnpm install
pnpm dev
```

想定URL:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8787`
- Health Check: `GET http://localhost:8787/api/health`

## 変更別の検証

- package 変更: `pnpm install`
- TypeScript 変更: `pnpm -r build`
- テスト追加・変更: `pnpm -r test`
- Backend 変更: `GET /api/health` と該当 API の確認
- Frontend 変更: Nuxt dev server で画面確認
- Firebase 設定変更: `firebase-commons/.gitignore` に秘密情報除外があることを確認

## 注意

検証コマンドがまだ存在しない場合は、推測で script を作らない。既存 script の候補と変更範囲を示し、必要ならユーザーに確認する。

