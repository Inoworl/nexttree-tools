# nexttree-tools

Next Tree の業務ツール群を管理する pnpm workspace モノレポです。

最初のアプリは `biwa-counter` で、写真からびわの売れた個数を推定し、必要に応じて人間が修正して記録する Web アプリです。

## Structure

```text
nexttree-tools/
  apps/
    biwa-counter/
      frontend/      # Nuxt 3 frontend
      backend/       # Hono backend (Cloud Run 前提)
  packages/
    shared/          # API 型、共通型 (@nexttree/shared)
    ui/              # 共有 UI 部品の置き場 (@nexttree/ui)
    vision/          # 画像解析ロジックの置き場 (@nexttree/vision)
  docker/
    compose/
  firebase-commons/  # Firebase 共通設定の置き場 (実値はコミットしない)
  dos/               # 仕様、業務内容、設計判断
  .ai/               # AI エージェント向け作業参照
```

## Setup

前提: Node.js 22 以上。pnpm は corepack で有効化します。

```bash
corepack enable
pnpm install
```

環境変数はルートの `.env.example` を参考に設定してください(初期構成ではデフォルト値のまま動作します)。

## Local development

```bash
pnpm dev
```

frontend と backend が同時に起動します。

- Frontend: http://localhost:3000
- Backend: http://localhost:8787
- Health Check: `GET http://localhost:8787/api/health` が `{ "status": "ok" }` を返します

Docker を使う場合:

```bash
docker compose --profile app up frontend backend
```

Docker 構成とポート管理の詳細は [docker/README.md](docker/README.md) を参照してください。

## 初期実装範囲

- pnpm workspace によるモノレポ初期化
- Nuxt frontend の最小構成(写真アップロード画面の仮UI)
- Hono backend の最小構成(`GET /api/health`)
- `packages/shared` の共通型 (`CountTarget` / `CountRecord` / `HealthResponse`)
- `packages/vision` の画像解析プレースホルダ
- `.env.example`
- `firebase-commons/` の設定置き場

## 未実装範囲

- AI 解析の本実装
- Firebase Authentication
- Firestore 保存
- Storage 保存
- Cloud Run 本番デプロイ
- 管理画面
- 決済
- 高度な権限管理

仕様の詳細は [dos/project-spec.md](dos/project-spec.md) と [dos/biwa-counter-requirements.md](dos/biwa-counter-requirements.md) を参照してください。
