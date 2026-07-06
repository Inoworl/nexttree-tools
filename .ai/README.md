# AIエージェント向け開発参照

更新日: 2026-07-06

このディレクトリは、AIエージェントが `nexttree-tools` を開発するときに読むための作業用ドキュメントを置く。

## 読む順番

1. `.ai/README.md`
2. `.ai/requirements.md`
3. `dos/project-spec.md`
4. `dos/biwa-counter-requirements.md`
5. `dos/architecture.md`
6. `.ai/agent-guidelines.md`
7. `.ai/implementation-plan.md`
8. `.ai/coding-rules/project.md`

## ディレクトリの役割

- `dos/`: アプリやプロジェクトの仕様、業務内容、設計判断
- `.ai/`: AIエージェントが開発時に確認する計画、参照、作業ルール

## 重要方針

- いきなり大規模実装しない
- まず最小構成で起動確認する
- 仕様の一次情報は `dos/` を参照する
- `.ai/` は実装時の進め方、チェックリスト、作業判断を管理する
- `.env` や秘密情報は読み書きしない

