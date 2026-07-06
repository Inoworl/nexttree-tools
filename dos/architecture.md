# nexttree-tools 初期アーキテクチャ

更新日: 2026-07-06

## 採用するディレクトリ構成

```text
nexttree-tools
├── apps
│   ├── biwa-counter
│   │   ├── frontend
│   │   └── backend
│   ├── website
│   └── admin
├── packages
│   ├── shared
│   ├── ui
│   └── vision
├── dos
│   ├── project-spec.md
│   ├── biwa-counter-requirements.md
│   ├── architecture.md
│   └── decisions.md
├── firebase-commons
│   ├── .firebaserc.example
│   ├── .gitignore
│   ├── README.md
│   └── config
│       ├── dev
│       │   └── .gitkeep
│       └── prod
│           └── .gitkeep
├── .ai
│   ├── README.md
│   ├── requirements.md
│   ├── implementation-plan.md
│   ├── agent-guidelines.md
│   ├── workflows
│   ├── agent-profiles
│   └── coding-rules
│       └── project.md
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## コンポーネント責務

| パス | 責務 |
| --- | --- |
| `apps/biwa-counter/frontend` | Nuxt 3 によるユーザー画面 |
| `apps/biwa-counter/backend` | Hono による Cloud Run 前提の業務API |
| `apps/website` | 将来のホームページ |
| `apps/admin` | 将来の管理画面 |
| `packages/shared` | API 型、共通型、共有ユーティリティ |
| `packages/ui` | 複数アプリで共有するUI部品 |
| `packages/vision` | 画像解析、AI連携、画像前処理の抽象化 |
| `dos` | 業務内容、仕様、設計判断のドキュメント |
| `firebase-commons` | Firebase 共通設定、環境別設定置き場、サンプル設定 |
| `.ai` | AIエージェントが開発時に読む計画、参照、作業ルール |
| `.ai/workflows` | ツール非依存の作業手順 |
| `.ai/agent-profiles` | Codex、Claude Code などツール別の補足 |

## Backend 方針

Backend は Firebase Functions ではなく、Cloud Run 上で動く Hono API として構築する。

理由:

- AI画像解析との相性が良い
- OpenAI / Gemini などの外部API連携がしやすい
- 将来 Go / Rust / Python に差し替えやすい
- 画像前処理やバッチ処理を追加しやすい
- 業務ロジックを Firebase に寄せすぎずに済む

初期は Hono + TypeScript を採用する。

## Firebase の役割

Firebase は以下に使う。

- Firebase Hosting
- Firebase Authentication
- Firestore
- Firebase Storage / Cloud Storage

Firebase 関連の共通設定は `firebase-commons/` に置く。

`firebase-commons/` にはサンプルとディレクトリ構造だけをコミットする。`.firebaserc`、`.env`、サービスアカウントキー、秘密鍵、CI token はコミットしない。

Cloud Run は以下に使う。

- 画像解析 API
- AI API 連携
- 業務ロジック API
- 将来的な画像前処理

## 依存方向

```text
apps/* -> packages/shared
apps/* -> packages/ui
apps/biwa-counter/backend -> packages/vision
packages/vision -> external AI providers
```

業務ロジックは Cloud Run 側の Backend に寄せる。Firebase は認証、保存、ホスティング基盤として使う。
