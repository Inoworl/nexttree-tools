# nexttree-tools

Next Tree の業務ツール群を管理する pnpm workspace モノレポです。

## Structure

```text
nexttree-tools/
  apps/
    biwa-counter/
      frontend/
      backend/
    website/
    admin/
  packages/
    shared/
    ui/
    vision/
  docker/
    compose/
  firebase-commons/
  dos/
```

## Local development

通常のローカル起動目標:

```bash
pnpm install
pnpm dev
```

Docker を使う場合:

```bash
docker compose --profile app up frontend backend
```

Docker 構成とポート管理の詳細は [docker/README.md](docker/README.md) を参照してください。

## Initial app

最初のアプリは `apps/biwa-counter` です。Nuxt frontend と Hono backend を分け、共通型は `packages/shared` に置きます。
