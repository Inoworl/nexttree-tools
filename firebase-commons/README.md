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
├── firebase.json
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

## produce-counter の Hosting

Nuxt の静的ファイルを生成し、Firebase project ディレクトリ内の `dist/produce-counter` へ配置する。`dist/` は Git 管理対象外である。
Hosting用の生成では、未使用のAPI URLを空にしてローカルURLが公開成果物へ入らないようにする。

```bash
docker compose -f docker/compose/docker-compose.dev.yml --profile app run \
  --rm --no-deps frontend sh -lc \
  "corepack pnpm --dir /workspace hosting:prepare:produce-counter"
```

Hosting Emulator で確認する。

```bash
cd firebase-commons
firebase emulators:start --only hosting:produce-counter --project dev
```

dev 環境へのデプロイは、次のコマンドで `nexttree-tools-produce-dev` だけを対象にする。

```bash
cd firebase-commons
firebase deploy --only hosting:produce-counter --project dev
```

prod 環境へは、明示的に承認されたリリース作業でのみデプロイする。

## 禁止事項

以下はこのディレクトリにコミットしない。

- `.env`
- `.env.local`
- `service-account-key.json`
- `*-service-account-key.json`
- Firebase Admin SDK の秘密鍵
- CI/CD token
- DB password
