# nexttree-tools プロジェクト仕様

更新日: 2026-07-06

## 目的

`nexttree-tools` は、Next Tree の業務を支える汎用業務ツール群のモノレポである。

最初のアプリとして、写真からびわの売れた個数を推定・記録する Web アプリ `biwa-counter` を構築する。

将来的には、以下の業務にも対応できる構成にする。

- ホームページ
- 商品管理
- 注文管理
- 収穫記録
- 在庫管理
- その他の業務アプリ
- びわ以外の農産物・商品カウント

## 初期アプリ

- アプリ名: `biwa-counter`
- 目的: 写真からびわの個数を推定し、必要に応じて人間が修正して記録する
- 初期段階では AI 解析の本実装は行わない

## 技術方針

| 領域 | 採用技術 |
| --- | --- |
| Frontend | Nuxt 3 |
| Backend | Hono on Cloud Run |
| Auth | Firebase Authentication |
| Database | Firestore |
| Storage | Firebase Storage / Cloud Storage |
| Hosting | Firebase Hosting |
| Package Manager | pnpm |
| Repository | Monorepo |

## 初期機能

最初に作る範囲は以下に限定する。

1. モノレポ初期化
2. Nuxt frontend 起動
3. Hono backend 起動
4. `GET /api/health`
5. shared 型定義
6. 画像アップロード画面の仮UI
7. `.env.example`
8. `README.md`

## 今回はまだやらないこと

- 本番デプロイ
- 認証実装
- Firestore 保存
- Storage 保存
- AI 解析の本実装
- 管理画面
- 決済
- 高度な権限管理
- びわ以外の対象追加

ただし、後から追加しやすい構造にしておく。

## ローカル開発の目標

```bash
pnpm install
pnpm dev
```

想定URL:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8787`

