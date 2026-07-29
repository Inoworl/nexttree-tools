# nexttree-tools プロジェクト仕様

更新日: 2026-07-30

## 目的

`nexttree-tools` は、Next Tree の業務を支える汎用業務ツール群のモノレポである。

最初のアプリとして、写真から農産物の数量を推定・記録する Web アプリ `produce-counter` を構築する。

将来的には、以下の業務にも対応できる構成にする。

- ホームページ
- 商品管理
- 注文管理
- 収穫記録
- 在庫管理
- その他の業務アプリ
- 対象農産物・品種・カウント単位の追加

## 初期アプリ

- アプリ名: `produce-counter`
- 目的: 写真から農産物の数量を推定し、必要に応じて人間が修正して記録する
- 初期対象: びわ、キウイ、栗
- カウント単位: パック、個、箱
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
6. 商品・品種・カウント単位を選べる画像アップロード画面
7. デモ解析結果と認識箇所の赤枠表示
8. 卸先と独立した業務日付を先に確定する作業開始画面
9. 人間の修正値、卸先スナップショット、業務日付のブラウザ保存
10. `.env.example`
11. `README.md`

## 今回はまだやらないこと

- 本番デプロイ
- 認証実装
- Firestore 保存
- Storage 保存
- AI 解析の本実装
- 管理画面
- 決済
- 高度な権限管理
- デモ対象以外の商品マスタ管理

ただし、商品・品種・単位を追加しやすい構造にしておく。

## ローカル開発の目標

```bash
pnpm install
pnpm dev
```

想定URL:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8787`
