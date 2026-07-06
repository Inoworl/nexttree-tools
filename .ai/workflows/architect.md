# Architect Workflow

更新日: 2026-07-06

## 目的

実装前に、構成、責務分離、依存方向、将来拡張の余地を明確にする。

## 手順

1. `dos/architecture.md` と `dos/decisions.md` を確認する。
2. 変更対象が frontend、backend、packages、Firebase のどこに属するか決める。
3. 共有型は `packages/shared`、画像解析は `packages/vision`、Firebase 設定は `firebase-commons` に寄せる。
4. 業務ロジックを Firebase に寄せすぎていないか確認する。
5. 大きな設計判断は `dos/decisions.md` に ADR として記録する。

## 判断基準

- 最小構成で起動確認できること
- びわ以外の対象に拡張できること
- Cloud Run 前提の backend 境界を保つこと
- Firebase は認証、保存、ホスティング基盤として扱うこと

