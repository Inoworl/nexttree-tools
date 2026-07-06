# Code Workflow

更新日: 2026-07-06

## 目的

小さく実装し、既存方針と矛盾しない形で検証まで進める。

## 手順

1. `AGENTS.md`、`.ai/requirements.md`、`.ai/coding-rules/project.md` を確認する。
2. 作業範囲に対応する `dos/` の仕様を確認する。
3. 変更予定ファイルと実装範囲をユーザーに提示し、許可を得る。
4. 小さい単位で実装する。
5. 変更範囲に応じて `.ai/workflows/testing.md` の検証を行う。
6. README や `.ai/implementation-plan.md` の更新が必要なら反映する。
7. 変更内容、検証結果、未検証理由を報告する。

## 注意

- `.env`、鍵、サービスアカウントキーは読まない。
- 実値の Firebase 設定はコミットしない。
- ユーザーや別作業の差分を勝手に変更・破棄しない。

