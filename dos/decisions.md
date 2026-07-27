# 設計判断メモ

更新日: 2026-07-06

## ADR-001: モノレポを採用する

決定: `nexttree-tools` は pnpm workspace によるモノレポ構成にする。

理由:

- 複数の業務アプリを同一リポジトリで管理できる
- 共通型、UI、画像解析ロジックを `packages` として共有できる
- `produce-counter` 以外のアプリを追加しやすい

## ADR-002: Backend は Firebase Functions ではなく Cloud Run + Hono にする

決定: 初期 Backend は Hono + TypeScript で実装し、Cloud Run で動かす前提にする。

理由:

- AI画像解析や外部API連携を追加しやすい
- 実行環境の自由度が高い
- 将来的に Go / Rust / Python へ差し替えやすい
- Firebase に業務ロジックを寄せすぎない

## ADR-003: Firebase は認証・保存・ホスティング基盤として使う

決定: Firebase は Hosting、Authentication、Firestore、Storage / Cloud Storage に使う。

理由:

- フロントエンド配信、認証、データ保存を早く立ち上げられる
- 業務APIは Cloud Run に分離できる

## ADR-004: AI推定値と人間の修正値を分離する

決定: `estimatedCount`、`correctedCount`、`finalCount` を分ける。

理由:

- AI の推定結果と人間の修正履歴を区別できる
- 将来、AI 精度改善や監査に使える
- `finalCount` は業務上使う確定値として扱いやすい

## ADR-005: 仕様ドキュメントとAI向け参照を分離する

決定: 業務・アプリ仕様は `dos/`、AIエージェント向けの開発参照は `.ai/` に置く。

理由:

- 人間が読む仕様と、AI が実装時に参照する作業ルールを分けられる
- `.ai/` に一時的・実行寄りの計画を書き、`dos/` に長期的な仕様を残せる

