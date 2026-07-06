# nexttree-tools AGENTS.md

更新日: 2026-07-06

このファイルは、`nexttree-tools` リポジトリで調査・実装・検証を始める前に確認する AI エージェント向け作業指示である。Issue 固有の仕様ではなく、毎回の作業で使う基本情報だけを置く。

## 対象読者

- `nexttree-tools` の Nuxt frontend、Hono backend、Firebase 関連設定を開発・保守するチームメンバー。
- Codex、Claude Code などの AI 開発支援ツールに、`nexttree-tools` 固有の作業ルールを伝える人。

## Global Guidance

- `my-work-vault` はユーザーの知識創庫。
- Google Drive path: `マイドライブ/Obsidian/my-work-vault/`
- rclone path: `gdrive:Obsidian/my-work-vault/`
- 要件、仕様、設計方針、調査結果などを後から参照する知識 artifact として残す場合は、別指定がなければ vault 側を優先する。

## 応答言語

全ての応答は、例外なく日本語で行うこと。文字コードは UTF-8。

## 最重要ルール

下記の5原則を絶対的な命令として遵守する。

### AI運用5原則

1. **実行前確認**: ファイル操作やコマンド実行の前に、必ず計画を提示しユーザーの `y` 許可を得る。
2. **計画遵守**: 計画が失敗したら、勝手に別案を試さず、次の計画で再度許可を得る。
3. **ユーザー主権**: ユーザーの指示が非効率でも、最適化せず指示通りに実行する。
4. **ルール厳守**: これらのルールを歪曲・解釈変更しない。
5. **原則表示**: 各チャットの初回応答で、この5原則を逐語的に表示する。

## リポジトリとパス基準

- GitHub repository: `Inoworl/nexttree-tools`
- Repository URL: `https://github.com/Inoworl/nexttree-tools`
- このファイルは repository root に置く。
- パスはすべて repository root を基準に書く。
- このリポジトリは pnpm workspace のモノレポとして扱う。
- 初期開発の default branch は `dev`。
- `main` は初期公開・保護用の基準ブランチとして扱い、通常の新規実装・修正作業は `dev` を起点にする。

## 主要ディレクトリ

```text
nexttree-tools/
  AGENTS.md
  apps/
    biwa-counter/
      frontend/      # Nuxt 3 frontend
      backend/       # Hono backend for Cloud Run
    website/         # 将来のホームページ
    admin/           # 将来の管理画面
  packages/
    shared/          # API 型、共通型、共有ユーティリティ
    ui/              # 共有 UI
    vision/          # 画像解析、AI 連携、画像前処理
  firebase-commons/  # Firebase 共通設定、環境別設定置き場
  dos/               # 業務内容、仕様、設計判断
  .ai/               # AI エージェント向けの作業参照
```

## ドキュメント配置

### `dos/`

アプリやプロジェクトの仕様、業務内容、設計判断を記載する。

主なファイル:

- `dos/project-spec.md`
- `dos/biwa-counter-requirements.md`
- `dos/architecture.md`
- `dos/decisions.md`

### `.ai/`

AI エージェントが開発の際に読み込んだり確認したりする参照情報を記載する。

主なファイル:

- `.ai/README.md`
- `.ai/requirements.md`
- `.ai/implementation-plan.md`
- `.ai/agent-guidelines.md`
- `.ai/workflows/`
- `.ai/agent-profiles/`
- `.ai/coding-rules/project.md`

## 実装前に確認する情報

- 仕様の一次情報は `dos/` を確認する。
- 実装時の作業判断、計画、チェックリストは `.ai/` を確認する。
- 外部スキルやツールが使えない環境では、`.ai/workflows/` の Markdown 手順を正とする。
- Codex や Claude Code などツール固有の読み替えは `.ai/agent-profiles/` を確認する。
- Code モード時は `./.ai/coding-rules/` ディレクトリ内の規約を確認する。
- `.ai/tmp/`、`.ai/secrets/`、認証情報、テストアカウント、個人情報、外部サービス token を含む可能性があるファイルは、必要な場合だけユーザーに確認してから読む。
- `.ai` 配下でも、ファイル名や配置から機密情報の可能性があるものは読まず、必要性を説明して確認する。

## 開発モード

状況に応じて自動切替する。外部スキル名は必須ではない。利用できる場合だけ補助的に使う。

- PM: 要件定義・計画。`.ai/workflows/pm.md` を参照する。
- Architect: 設計・技術選定。`.ai/workflows/architect.md` を参照する。
- Code: 実装・テスト。`.ai/workflows/code.md` を参照する。
- PMO: 品質管理・レビュー。`.ai/workflows/pmo.md` を参照する。

## ツール非依存の作業ルール

- 調査・探索: 3ファイル以上の読み込みが必要な場合は段階的に調査する。
- テスト実行: `.ai/workflows/testing.md` を参照する。
- コードレビュー: `.ai/workflows/review.md` を参照する。
- 品質検証: `.ai/workflows/pmo.md` を参照する。
- 学習の蓄積: `.ai/workflows/learning.md` を参照し、プロジェクト固有の知見は `dos/learnings/` に残す。
- Codex のローカルスキル、Claude Code の独自機能、MCP などは、利用できる場合だけ補助として使う。
- ツール固有機能を使う場合も、最終的な作業結果がこのリポジトリ内の文書と矛盾しないようにする。

## 作業プロセス

原則として、次の順序で進める。

```text
要件分析(PM) -> 設計(Architect) -> 実装(Code) -> 品質確認(PMO)
```

各ステップで AI運用5原則の「実行前確認」を優先し、ユーザーの許可を得てから進める。

## ブランチ運用

- default branch は `dev`。
- 新規実装・修正作業は、最新の `origin/dev` を確認してから専用ブランチで進める。
- `main` へ直接作業コミットを積むのは、ユーザーが明示した場合に限る。
- 既存作業ツリーに未コミット変更がある場合は、それを勝手に変更・破棄しない。
- ブランチ切り替えが必要で未コミット変更がある場合は、stash、commit、別 clone などの方針を人間に確認してから進める。

## 技術方針

- Frontend は Nuxt 3 を使う。
- Backend は Hono + TypeScript を使い、Cloud Run 前提で構築する。
- Package manager は pnpm を使う。
- Firebase は Hosting、Authentication、Firestore、Storage / Cloud Storage に使う。
- 業務ロジックは Firebase Functions ではなく、Cloud Run 上の Hono API に寄せる。
- API 型は `packages/shared` に置く。
- 画像解析ロジックは `packages/vision` に分離する。
- AI 推定値と人間の修正値を分けて扱う。
- びわ以外にも拡張できるよう `target` で管理する。

## Firebase

- Firebase 共通設定は `firebase-commons/` に置く。
- `firebase-commons/` にはサンプルとディレクトリ構造だけをコミットする。
- 実際の `.firebaserc`、`.env`、サービスアカウントキー、秘密鍵、CI token はコミットしない。
- Firebase project ID は `firebase-commons/.firebaserc.example` を参考にローカルで復元する。
- Frontend / Backend だけで完結しない挙動は、`firebase-commons/` 側の設定方針も確認する。

## ローカル検証

初期目標の起動コマンド:

```bash
pnpm install
pnpm dev
```

想定URL:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8787`
- Health Check: `GET http://localhost:8787/api/health`

変更範囲に応じて、次の検証候補から選ぶ。

- TypeScript / package 変更: `pnpm install`、`pnpm -r build`、`pnpm -r test`
- Backend 変更: `GET /api/health`、該当 API のローカル確認
- Frontend 変更: Nuxt dev server 起動、主要画面の表示確認
- Firebase 設定変更: `firebase-commons/README.md` と `.gitignore` の方針に反していないか確認

検証コマンドがまだ存在しない場合は、推測で script を作らず、既存 script の候補と変更範囲を示してから実行方針を確認する。

## コミット・PR・完了報告

- コミット前に未コミット差分を確認し、ユーザーや別作業の差分を巻き込まない。
- PR 本文または完了報告には、変更内容、影響範囲、実行した検証、未検証の理由を簡潔に書く。
- Firebase、認証、課金、リリース設定、デプロイ設定に触れた場合は、PR 本文または完了報告で明示する。
- 機密値、token、鍵、個人情報、Firebase API key の値は、コミットメッセージ、PR 本文、ログ、完了報告に含めない。

## セキュリティと機密情報

以下は読取・変更禁止。

- `.env` 系ファイル
- `*/config/secrets.*`
- `src/env/*`
- `*.pem`
- `*.key`
- `service-account-key.json`
- `*-service-account-key.json`
- APIキーや認証情報を含むファイル全般

編集が必要な場合は必ずユーザーに確認する。

## 学習の蓄積

セッションで学んだプロジェクト固有の知見は `dos/learnings/` に記録する。

Codex 環境で `/learn` スキルが使える場合は補助的に使ってよい。ただし、別ユーザーや Claude Code でも参照できるよう、永続化すべき内容は必ずプロジェクト内の `dos/learnings/` または仕様に対応する `dos/` ファイルへ反映する。

## 保守メモ

- repo 名、default branch、Firebase project、検証コマンドが変わった場合は、このファイルも更新する。
- `dos/` または `.ai/` の構成を変更した場合は、このファイルとの矛盾がないか確認する。
- エージェント固有機能に依存するルールを追加する場合は、必ず `.ai/workflows/` にツール非依存の代替手順も用意する。
