# firebase-commons

更新日: 2026-07-06

このディレクトリは、`nexttree-tools` で共通利用する Firebase 関連設定の置き場である。

## 目的

- Firebase Hosting、Authentication、Firestore、Storage / Cloud Storage の設定をアプリ本体と分離する
- `dev` / `prod` など環境別の設定置き場を統一する
- 実値や秘密情報をコミットせず、サンプルとディレクトリ構造だけを管理する

## 方針

- 実際の `.firebaserc` はコミットしない
- Firebase project ID は `.firebaserc.example` を参考にローカルで復元する
- サービスアカウントキー、`.env`、CI token、秘密鍵はコミットしない
- 業務ロジックは Firebase Functions ではなく Cloud Run 上の Hono API に置く
- Firebase は認証、保存、ホスティング基盤として使う

## ディレクトリ構成

```text
firebase-commons/
├── .firebaserc.example
├── .gitignore
├── README.md
└── config/
    ├── dev/
    │   └── .gitkeep
    └── prod/
        └── .gitkeep
```

## ローカル設定

必要に応じて、以下のように `.firebaserc` をローカルで作成する。

```bash
cp firebase-commons/.firebaserc.example firebase-commons/.firebaserc
```

`.firebaserc` の project ID は実際の Firebase project に合わせて変更する。

## 禁止事項

以下はこのディレクトリにコミットしない。

- `.env`
- `.env.local`
- `service-account-key.json`
- `*-service-account-key.json`
- Firebase Admin SDK の秘密鍵
- CI/CD token
- DB password

