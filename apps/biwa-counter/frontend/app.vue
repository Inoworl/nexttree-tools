<script setup lang="ts">
import { resolveFinalCount } from '@nexttree/shared'

const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const estimatedCount = ref<number | null>(null)
const correctedCountInput = ref<string>('')
const saveMessage = ref<string | null>(null)

const correctedCount = computed<number | null>(() => {
  const trimmed = correctedCountInput.value.trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null
})

const finalCount = computed<number | null>(() => {
  if (estimatedCount.value === null && correctedCount.value === null) return null
  return resolveFinalCount(estimatedCount.value ?? 0, correctedCount.value)
})

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  imageFile.value = file
  saveMessage.value = null

  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = null
  }
  if (file) {
    imagePreviewUrl.value = URL.createObjectURL(file)
  }

  // AI 解析は未実装のため、初期段階では推定結果を持たない
  estimatedCount.value = null
}

function onSave() {
  // 保存 API (POST /api/counts) は未実装。実装後にここから呼び出す。
  saveMessage.value = '保存機能は未実装です。今後のリリースで対応します。'
}
</script>

<template>
  <main class="page">
    <h1>biwa-counter</h1>
    <p class="notice">AIによる推定結果です。必要に応じて修正してください。</p>

    <section class="section">
      <h2>写真アップロード</h2>
      <input type="file" accept="image/*" @change="onFileChange">
      <div v-if="imagePreviewUrl" class="preview">
        <img :src="imagePreviewUrl" alt="アップロードした写真のプレビュー">
      </div>
    </section>

    <section class="section">
      <h2>解析結果</h2>
      <p v-if="estimatedCount !== null">推定個数: {{ estimatedCount }} 個</p>
      <p v-else class="muted">未解析です。AI 解析は今後実装されます。</p>
    </section>

    <section class="section">
      <h2>個数の修正</h2>
      <label>
        修正後の個数
        <input
          v-model="correctedCountInput"
          type="number"
          min="0"
          step="1"
          placeholder="例: 12"
        >
      </label>
      <p v-if="finalCount !== null">記録される個数: {{ finalCount }} 個</p>
    </section>

    <section class="section">
      <button type="button" :disabled="!imageFile" @click="onSave">保存</button>
      <p v-if="saveMessage" class="muted">{{ saveMessage }}</p>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: sans-serif;
}

.notice {
  padding: 8px 12px;
  background-color: #fff7e0;
  border: 1px solid #e0c060;
  border-radius: 4px;
}

.section {
  margin-top: 24px;
}

.preview img {
  max-width: 100%;
  margin-top: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.muted {
  color: #666;
}

button {
  padding: 8px 24px;
}
</style>
