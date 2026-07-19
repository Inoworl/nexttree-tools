<script setup lang="ts">
import { ShieldCheck, Sprout } from '@lucide/vue'
import { resolveFinalCount } from '@nexttree/shared'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import CountRecordForm, {
  type RecordFormErrors,
} from './components/CountRecordForm.vue'
import PhotoAnalysisPanel from './components/PhotoAnalysisPanel.vue'
import RecentRecords from './components/RecentRecords.vue'
import { useDemoRecords } from './composables/useDemoRecords'
import {
  createDemoAnalysis,
  createDemoRecord,
  formatDateInputValue,
  parseCorrectedCount,
  validateImageDimensions,
  validateImageFile,
  validateRecordDetails,
  type DemoAnalysis,
} from './utils/demo-counter'

type RecordFormHandle = {
  focusFirstError: (errors: RecordFormErrors) => void
}

useHead({
  title: 'びわカウンター | Next Tree',
})

const selectedFile = ref<File | null>(null)
const imageUrl = ref<string | null>(null)
const fileError = ref<string | null>(null)
const analysis = ref<DemoAnalysis | null>(null)
const isAnalyzing = ref(false)
const correctedCountInput = ref('')
const storeName = ref('')
const recordDate = ref('')
const detailsErrors = ref<{
  storeName: string | null
  recordDate: string | null
}>({
  storeName: null,
  recordDate: null,
})
const saveMessage = ref<string | null>(null)
const recordForm = ref<RecordFormHandle | null>(null)
let analysisRequestId = 0

const { records, storageError, saveRecord } = useDemoRecords()

const correctedCount = computed(() =>
  parseCorrectedCount(correctedCountInput.value),
)

const finalCount = computed<number | null>(() => {
  if (analysis.value === null || correctedCount.value.error) return null
  return resolveFinalCount(
    analysis.value.estimatedCount,
    correctedCount.value.value,
  )
})

const formErrors = computed<RecordFormErrors>(() => ({
  correctedCount: correctedCount.value.error,
  storeName: detailsErrors.value.storeName,
  recordDate: detailsErrors.value.recordDate,
}))

const fileSizeLabel = computed(() => {
  if (!selectedFile.value) return null
  return `${(selectedFile.value.size / 1024 / 1024).toFixed(1)} MB`
})

onMounted(() => {
  recordDate.value = formatDateInputValue(new Date())
})

onBeforeUnmount(() => {
  analysisRequestId += 1
  revokeImageUrl()
})

function onFileSelected(file: File) {
  const error = validateImageFile(file)
  if (error) {
    fileError.value = error
    return
  }

  analysisRequestId += 1
  isAnalyzing.value = false
  revokeImageUrl()
  selectedFile.value = file
  imageUrl.value = URL.createObjectURL(file)
  fileError.value = null
  analysis.value = null
  correctedCountInput.value = ''
  saveMessage.value = null
}

function onImageLoaded(dimensions: { width: number, height: number }) {
  const error = validateImageDimensions(dimensions)
  if (!error) return

  fileError.value = error
  discardSelectedImage()
}

function onImageFailed() {
  fileError.value = '画像を読み込めませんでした。'
  discardSelectedImage()
}

async function onAnalyze() {
  if (!selectedFile.value || !imageUrl.value) return

  const requestId = ++analysisRequestId
  fileError.value = null
  isAnalyzing.value = true
  analysis.value = null
  correctedCountInput.value = ''
  saveMessage.value = null

  await new Promise(resolve => setTimeout(resolve, 650))
  if (requestId !== analysisRequestId) return

  analysis.value = createDemoAnalysis()
  isAnalyzing.value = false
}

async function onSave() {
  saveMessage.value = null
  detailsErrors.value = validateRecordDetails({
    storeName: storeName.value,
    recordDate: recordDate.value,
  })

  if (
    formErrors.value.correctedCount
    || formErrors.value.storeName
    || formErrors.value.recordDate
    || !analysis.value
    || !selectedFile.value
  ) {
    await nextTick()
    recordForm.value?.focusFirstError(formErrors.value)
    return
  }

  const timestamp = new Date().toISOString()
  const record = createDemoRecord({
    id: window.crypto.randomUUID(),
    fileName: selectedFile.value.name,
    storeName: storeName.value,
    recordDate: recordDate.value,
    estimatedCount: analysis.value.estimatedCount,
    correctedCount: correctedCount.value.value,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  if (saveRecord(record)) {
    saveMessage.value = `${record.storeName}の記録をブラウザに保存しました。`
  }
}

function onCorrectedCountUpdate(value: string) {
  correctedCountInput.value = value
  saveMessage.value = null
}

function onStoreNameUpdate(value: string) {
  storeName.value = value
  detailsErrors.value = { ...detailsErrors.value, storeName: null }
  saveMessage.value = null
}

function onRecordDateUpdate(value: string) {
  recordDate.value = value
  detailsErrors.value = { ...detailsErrors.value, recordDate: null }
  saveMessage.value = null
}

function discardSelectedImage() {
  analysisRequestId += 1
  isAnalyzing.value = false
  selectedFile.value = null
  analysis.value = null
  correctedCountInput.value = ''
  saveMessage.value = null
  revokeImageUrl()
}

function revokeImageUrl() {
  if (!imageUrl.value) return
  URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = null
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <a class="brand" href="#top" aria-label="びわカウンターの先頭へ">
          <span class="brand-mark" aria-hidden="true">
            <Sprout :size="22" />
          </span>
          <span>びわカウンター</span>
        </a>
        <span class="demo-badge">UI確認用デモ</span>
      </div>
    </header>

    <main id="top" class="page-main">
      <section class="page-intro" aria-labelledby="page-title">
        <div>
          <p class="eyebrow">販売個数の確認・記録</p>
          <h1 id="page-title">写真から個数を確認する</h1>
        </div>
        <div class="demo-notice">
          <ShieldCheck :size="20" aria-hidden="true" />
          <p>
            実際のAI解析・外部送信は行いません。写真は保存されず、記録はこのブラウザにのみ残ります。
          </p>
        </div>
      </section>

      <p class="ai-notice">
        AIによる推定結果です。必要に応じて修正してください。
      </p>

      <div class="workspace">
        <PhotoAnalysisPanel
          :image-url="imageUrl"
          :file-name="selectedFile?.name ?? null"
          :file-size-label="fileSizeLabel"
          :file-error="fileError"
          :analysis="analysis"
          :is-analyzing="isAnalyzing"
          @file-selected="onFileSelected"
          @analyze="onAnalyze"
          @image-loaded="onImageLoaded"
          @image-failed="onImageFailed"
        />

        <CountRecordForm
          ref="recordForm"
          :estimated-count="analysis?.estimatedCount ?? null"
          :final-count="finalCount"
          :corrected-count-input="correctedCountInput"
          :store-name="storeName"
          :record-date="recordDate"
          :errors="formErrors"
          :save-message="saveMessage"
          :save-error="storageError"
          @update:corrected-count-input="onCorrectedCountUpdate"
          @update:store-name="onStoreNameUpdate"
          @update:record-date="onRecordDateUpdate"
          @save="onSave"
        />
      </div>

      <RecentRecords :records="records" />
    </main>

    <footer class="app-footer">
      <p>Next Tree / biwa-counter demo</p>
    </footer>
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --color-canvas: #f4f6f4;
  --color-surface: #ffffff;
  --color-text: #1d2721;
  --color-text-muted: #5d6961;
  --color-border: #d5ddd7;
  --color-border-strong: #aebbb2;
  --color-control-border: #66736a;
  --color-accent: #286b47;
  --color-accent-strong: #175637;
  --color-danger: #b42318;
  --color-focus: #123c2a;
  font-family: Inter, "Hiragino Sans", "Yu Gothic UI", "Yu Gothic", sans-serif;
  font-synthesis: none;
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--color-canvas);
  scroll-behavior: auto;
}

body {
  min-width: 320px;
  margin: 0;
  color: var(--color-text);
  background: var(--color-canvas);
}

button,
input {
  font: inherit;
}

button,
label {
  -webkit-tap-highlight-color: transparent;
}

.app-shell {
  min-height: 100dvh;
}

.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.header-inner,
.page-main,
.app-footer p {
  width: min(1180px, calc(100% - 40px));
  margin-inline: auto;
}

.header-inner {
  display: flex;
  min-height: 64px;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  color: var(--color-text);
  font-size: 17px;
  font-weight: 800;
  text-decoration: none;
}

.brand:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 4px;
}

.brand-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #fff;
  background: var(--color-accent);
  border-radius: 6px;
}

.demo-badge,
.status-label {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 3px 9px;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.4;
  border-radius: 999px;
}

.demo-badge {
  color: #6c4807;
  background: #fff3d2;
  border: 1px solid #d9a234;
}

.page-main {
  display: grid;
  gap: 26px;
  padding-block: 42px 56px;
}

.page-intro {
  display: flex;
  gap: 30px;
  align-items: end;
  justify-content: space-between;
}

.eyebrow,
.section-kicker {
  margin: 0 0 6px;
  color: var(--color-accent-strong);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.4;
}

h1,
h2,
p {
  letter-spacing: 0;
}

h1,
h2 {
  text-wrap: balance;
}

h1 {
  max-width: 620px;
  margin: 0;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.2;
}

h2 {
  margin: 0;
  font-size: 20px;
  line-height: 1.35;
}

.demo-notice {
  display: flex;
  max-width: 460px;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  color: #364039;
  font-size: 13px;
  line-height: 1.6;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.demo-notice svg {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--color-accent-strong);
}

.demo-notice p,
.ai-notice {
  margin: 0;
  text-wrap: pretty;
}

.ai-notice {
  padding: 11px 14px;
  color: #68430a;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.55;
  background: #fff8e7;
  border-left: 4px solid #d39a2c;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(340px, 0.75fr);
  gap: 18px;
  align-items: start;
}

.tool-panel {
  padding: 22px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
}

.section-heading {
  display: flex;
  gap: 16px;
  align-items: start;
  justify-content: space-between;
}

.status-label-success {
  color: var(--color-accent-strong);
  background: #e5f3e9;
  border: 1px solid #a6cdb2;
}

.button {
  display: inline-flex;
  min-height: 44px;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 5px;
}

.button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.button-primary {
  color: #fff;
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.button-primary:not(:disabled):hover {
  background: var(--color-accent-strong);
  border-color: var(--color-accent-strong);
}

.button-secondary {
  color: var(--color-text);
  background: #fff;
  border-color: var(--color-control-border);
}

.button-secondary:hover {
  background: #f0f3f1;
  border-color: #66736a;
}

.field-hint,
.field-error {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
}

.field-hint {
  color: var(--color-text-muted);
}

.field-error {
  color: var(--color-danger);
  font-weight: 650;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.app-footer {
  padding-block: 20px;
  color: var(--color-text-muted);
  font-size: 12px;
  background: #fff;
  border-top: 1px solid var(--color-border);
}

.app-footer p {
  margin-block: 0;
}

@media (max-width: 899px) {
  .page-intro {
    display: grid;
  }

  .demo-notice {
    max-width: none;
  }

  .workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 639px) {
  .header-inner,
  .page-main,
  .app-footer p {
    width: min(100% - 24px, 1180px);
  }

  .header-inner {
    min-height: 58px;
  }

  .brand {
    font-size: 15px;
  }

  .brand-mark {
    width: 32px;
    height: 32px;
  }

  .page-main {
    gap: 20px;
    padding-block: 28px 42px;
  }

  h1 {
    font-size: 30px;
  }

  .tool-panel {
    padding: 16px;
  }
}
</style>
