# nexttree-tools

Next Tree の業務ツール群を管理する pnpm workspace モノレポです。

## Docker local development

ポートは Obsidian vault の `projects/port-management-registry.md` に登録した `PROJECT_ID=37` を使います。

| Service | Container port | Host port | URL |
| --- | ---: | ---: | --- |
| frontend | 3000 | 13700 | http://localhost:13700 |
| backend | 8787 | 13701 | http://localhost:13701 |

アプリ実装後の起動コマンド:

```bash
docker compose --profile app up frontend backend
```

ワークスペースだけを起動してコンテナ内で確認する場合:

```bash
docker compose up -d workspace
docker compose exec workspace sh
```

Backend の health check は、実装後に以下で確認します。

```bash
curl http://localhost:13701/api/health
```
