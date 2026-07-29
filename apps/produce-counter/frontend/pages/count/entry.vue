<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue'
import {
  resolveFinalCount,
  type CountWorkContext,
  type CountUnit,
  type ProductId,
} from '@nexttree/shared'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import CountConfigurationPanel from '../../components/CountConfigurationPanel.vue'
import CountRecordForm, {
  type RecordFormErrors,
} from '../../components/CountRecordForm.vue'
import PhotoAnalysisPanel from '../../components/PhotoAnalysisPanel.vue'
import RecentRecords from '../../components/RecentRecords.vue'
import WorkContextHeader from '../../components/WorkContextHeader.vue'
import { useDemoRecords } from '../../composables/useDemoRecords'
import { resolveCountWorkContext } from '../../utils/count-work-context'
import {
  COUNT_UNIT_OPTIONS,
  PRODUCT_OPTIONS,
  createDemoAnalysis,
  createDemoRecord,
  getCountUnitLabel,
  getProductOption,
  getVarietyOption,
  parseCorrectedCount,
  validateImageDimensions,
  validateImageFile,
  type DemoAnalysis,
} from '../../utils/demo-counter'

type RecordFormHandle = {
  focusFirstError: (errors: RecordFormErrors) => void
}

type ConfigurationHandle = {
  focusProduct: () => void
}

useHead({
  title: 'カウント入力 | 農産物カウンター',
})

const route = useRoute()
const workContext = ref<CountWorkContext | null>(null)
const isContextReady = ref(false)
const productId = ref<ProductId | ''>('')
const varietyId = ref('')
const countUnit = ref<CountUnit | ''>('')
const selectedFile = ref<File | null>(null)
const imageUrl = ref<string | null>(null)
const fileError = ref<string | null>(null)
const analysis = ref<DemoAnalysis | null>(null)
const isAnalyzing = ref(false)
const correctedCountInput = ref('')
const saveMessage = ref<string | null>(null)
const isCurrentRecordSaved = ref(false)
const recordForm = ref<RecordFormHandle | null>(null)
const configuration = ref<ConfigurationHandle | null>(null)
let analysisRequestId = 0

const { records, storageError, saveRecord } = useDemoRecords()

const selectedProduct = computed(() => (
  productId.value ? getProductOption(productId.value) : null
))
const varietyOptions = computed(() => selectedProduct.value?.varieties ?? [])
const selectedVariety = computed(() => (
  productId.value && varietyId.value
    ? getVarietyOption(productId.value, varietyId.value)
    : null
))
const countUnitLabel = computed(() => (
  countUnit.value ? getCountUnitLabel(countUnit.value) : ''
))
const correctedCount = computed(() => (
  parseCorrectedCount(correctedCountInput.value)
))
const finalCount = computed<number | null>(() => {
  if (analysis.value === null || correctedCount.value.error) return null
  return resolveFinalCount(
    analysis.value.estimatedCount,
    correctedCount.value.value,
  )
})
const formErrors = computed<RecordFormErrors>(() => ({
  correctedCount: correctedCount.value.error,
}))
const fileSizeLabel = computed(() => {
  if (!selectedFile.value) return null
  return `${(selectedFile.value.size / 1024 / 1024).toFixed(1)} MB`
})
const hasUnsavedWork = computed(() => (
  !isCurrentRecordSaved.value
  && (
    selectedFile.value !== null
    || analysis.value !== null
    || isAnalyzing.value
    || correctedCountInput.value !== ''
  )
))

onMounted(async () => {
  window.addEventListener('beforeunload', onBeforeUnload)
  workContext.value = resolveCountWorkContext(route.query)
  isContextReady.value = true

  if (!workContext.value) {
    await navigateTo('/count/new', { replace: true })
  }
})

onBeforeRouteLeave(() => {
  if (!hasUnsavedWork.value) return true
  return window.confirm(
    '保存していない作業内容があります。移動してもよろしいですか？',
  )
})

onBeforeRouteUpdate((to) => {
  const nextContext = resolveCountWorkContext(to.query)
  if (!nextContext) return '/count/new'

  if (
    workContext.value?.destinationId === nextContext.destinationId
    && workContext.value.recordDate === nextContext.recordDate
  ) {
    return true
  }

  if (
    hasUnsavedWork.value
    && !window.confirm(
      '保存していない作業内容があります。移動してもよろしいですか？',
    )
  ) {
    return false
  }

  resetCountInput()
  workContext.value = nextContext
  return true
})

onBeforeUnmount(() => {
  analysisRequestId += 1
  window.removeEventListener('beforeunload', onBeforeUnload)
  revokeImageUrl()
})

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (!hasUnsavedWork.value) return
  event.preventDefault()
  event.returnValue = ''
}

function onProductIdUpdate(value: ProductId) {
  const product = getProductOption(value)
  const defaultVariety = product.varieties[0]
  if (!defaultVariety) return

  productId.value = value
  varietyId.value = defaultVariety.id
  countUnit.value = defaultVariety.defaultCountUnit
  resetAnalysisForConfigurationChange()
}

function onVarietyIdUpdate(value: string) {
  if (!productId.value) return
  const variety = getVarietyOption(productId.value, value)
  varietyId.value = value
  countUnit.value = variety.defaultCountUnit
  resetAnalysisForConfigurationChange()
}

function onCountUnitUpdate(value: CountUnit) {
  countUnit.value = value
  resetAnalysisForConfigurationChange()
}

function resetAnalysisForConfigurationChange() {
  analysisRequestId += 1
  isAnalyzing.value = false
  analysis.value = null
  correctedCountInput.value = ''
  saveMessage.value = null
  isCurrentRecordSaved.value = false
}

function onFileSelected(file: File) {
  if (!selectedProduct.value) return

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
  isCurrentRecordSaved.value = false
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
  if (!selectedFile.value || !imageUrl.value || !selectedProduct.value) return

  const requestId = ++analysisRequestId
  fileError.value = null
  isAnalyzing.value = true
  analysis.value = null
  correctedCountInput.value = ''
  saveMessage.value = null
  isCurrentRecordSaved.value = false

  await new Promise(resolve => setTimeout(resolve, 650))
  if (requestId !== analysisRequestId) return

  analysis.value = createDemoAnalysis()
  isAnalyzing.value = false
}

async function onSave() {
  saveMessage.value = null

  if (
    formErrors.value.correctedCount
    || !workContext.value
    || !analysis.value
    || !selectedFile.value
    || !productId.value
    || !selectedProduct.value
    || !selectedVariety.value
    || !countUnit.value
  ) {
    await nextTick()
    recordForm.value?.focusFirstError(formErrors.value)
    return
  }

  const timestamp = new Date().toISOString()
  const record = createDemoRecord({
    id: window.crypto.randomUUID(),
    destinationId: workContext.value.destinationId,
    destinationName: workContext.value.destinationName,
    recordDate: workContext.value.recordDate,
    productId: productId.value,
    productLabel: selectedProduct.value.label,
    varietyId: varietyId.value,
    varietyLabel: selectedVariety.value.label,
    countUnit: countUnit.value,
    countUnitLabel: countUnitLabel.value,
    fileName: selectedFile.value.name,
    estimatedCount: analysis.value.estimatedCount,
    correctedCount: correctedCount.value.value,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  if (saveRecord(record)) {
    saveMessage.value = `${record.destinationName}の記録をブラウザに保存しました。`
    isCurrentRecordSaved.value = true
  }
}

function onCorrectedCountUpdate(value: string) {
  correctedCountInput.value = value
  saveMessage.value = null
  isCurrentRecordSaved.value = false
}

async function onStartNextRecord() {
  resetCountInput()
  await nextTick()
  configuration.value?.focusProduct()
}

function onFinishWork() {
  return navigateTo('/count/new')
}

function onChangeContext() {
  return navigateTo('/count/new')
}

function resetCountInput() {
  discardSelectedImage()
  productId.value = ''
  varietyId.value = ''
  countUnit.value = ''
  fileError.value = null
  saveMessage.value = null
  isCurrentRecordSaved.value = false
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
  <main
    v-if="workContext"
    class="page-main entry-page"
    data-testid="count-workspace"
  >
    <WorkContextHeader
      :context="workContext"
      @change="onChangeContext"
      @finish="onFinishWork"
    />

    <section class="page-intro" aria-labelledby="page-title">
      <div>
        <p class="eyebrow">販売数量の確認・記録</p>
        <h1 id="page-title">写真から数量を確認する</h1>
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
      <CountConfigurationPanel
        ref="configuration"
        :product-id="productId"
        :product-options="PRODUCT_OPTIONS"
        :variety-id="varietyId"
        :variety-options="varietyOptions"
        :count-unit="countUnit"
        :count-unit-options="COUNT_UNIT_OPTIONS"
        @update:product-id="onProductIdUpdate"
        @update:variety-id="onVarietyIdUpdate"
        @update:count-unit="onCountUnitUpdate"
      />

      <PhotoAnalysisPanel
        :product-label="selectedProduct?.label ?? null"
        :count-unit-label="countUnitLabel"
        :image-url="imageUrl"
        :file-name="selectedFile?.name ?? null"
        :file-size-label="fileSizeLabel"
        :file-error="fileError"
        :analysis="analysis"
        :is-analyzing="isAnalyzing"
        :disabled="!selectedProduct"
        @file-selected="onFileSelected"
        @analyze="onAnalyze"
        @image-loaded="onImageLoaded"
        @image-failed="onImageFailed"
      />

      <CountRecordForm
        ref="recordForm"
        :count-unit-label="countUnitLabel"
        :estimated-count="analysis?.estimatedCount ?? null"
        :final-count="finalCount"
        :corrected-count-input="correctedCountInput"
        :errors="formErrors"
        :save-message="saveMessage"
        :save-error="storageError"
        :is-saved="isCurrentRecordSaved"
        @update:corrected-count-input="onCorrectedCountUpdate"
        @save="onSave"
        @start-next="onStartNextRecord"
        @finish="onFinishWork"
      />
    </div>

    <RecentRecords :records="records" />
  </main>

  <main v-else class="page-main context-loading">
    <p>
      {{ isContextReady
        ? '作業開始画面へ戻ります。'
        : '作業情報を確認しています。' }}
    </p>
  </main>
</template>

<style scoped>
.entry-page {
  align-content: start;
}

.workspace {
  display: grid;
  grid-template-areas:
    "configuration photo"
    "record photo";
  grid-template-columns: minmax(320px, 0.72fr) minmax(0, 1.4fr);
  gap: 18px;
  align-items: start;
}

.context-loading {
  place-content: center;
  color: var(--color-text-muted);
}

@media (max-width: 899px) {
  .workspace {
    grid-template-areas:
      "configuration"
      "photo"
      "record";
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
