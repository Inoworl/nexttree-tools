import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import type { HealthResponse } from '@nexttree/shared'

const app = new Hono()

app.get('/api/health', (c) => {
  const body: HealthResponse = { status: 'ok' }
  return c.json(body)
})

// Cloud Run は PORT 環境変数で待ち受けポートを指定する
const port = Number(process.env.PORT ?? 8787)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`produce-counter backend listening on http://localhost:${info.port}`)
})

export default app
