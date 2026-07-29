<script setup lang="ts">
import { ShieldCheck } from '@lucide/vue'
import { computed, nextTick, onMounted, ref } from 'vue'
import DestinationSelector from '../../components/DestinationSelector.vue'
import {
  createCountEntryLocation,
  validateWorkContextSelection,
  type WorkContextErrors,
} from '../../utils/count-work-context'
import { DESTINATION_OPTIONS } from '../../utils/destination-catalog'
import { formatDateInputValue } from '../../utils/demo-counter'

type DestinationSelectorHandle = {
  focusFirstError: (errors: WorkContextErrors) => void
}

useHead({
  title: '作業開始 | 農産物カウンター',
})

const destinationId = ref('')
const recordDate = ref('')
const errors = ref<WorkContextErrors>({
  destinationId: null,
  recordDate: null,
})
const selector = ref<DestinationSelectorHandle | null>(null)

const canSubmit = computed(() => {
  const validation = validateWorkContextSelection({
    destinationId: destinationId.value,
    recordDate: recordDate.value,
  })
  return !validation.destinationId && !validation.recordDate
})

onMounted(() => {
  if (!recordDate.value) recordDate.value = formatDateInputValue(new Date())
})

function onDestinationUpdate(value: string) {
  destinationId.value = value
  errors.value = { ...errors.value, destinationId: null }
}

function onRecordDateUpdate(value: string) {
  recordDate.value = value
  errors.value = { ...errors.value, recordDate: null }
}

async function onSubmit() {
  errors.value = validateWorkContextSelection({
    destinationId: destinationId.value,
    recordDate: recordDate.value,
  })

  if (errors.value.destinationId || errors.value.recordDate) {
    await nextTick()
    selector.value?.focusFirstError(errors.value)
    return
  }

  await navigateTo(createCountEntryLocation({
    destinationId: destinationId.value,
    recordDate: recordDate.value,
  }))
}
</script>

<template>
  <main class="page-main start-page">
    <section class="page-intro" aria-labelledby="page-title">
      <div>
        <p class="eyebrow">販売数量の確認・記録</p>
        <h1 id="page-title">カウント作業を始める</h1>
      </div>
      <div class="demo-notice">
        <ShieldCheck :size="20" aria-hidden="true" />
        <p>
          実際のAI解析・外部送信は行いません。記録はこのブラウザにのみ残ります。
        </p>
      </div>
    </section>

    <DestinationSelector
      ref="selector"
      :destination-id="destinationId"
      :record-date="recordDate"
      :destinations="DESTINATION_OPTIONS"
      :errors="errors"
      :can-submit="canSubmit"
      @update:destination-id="onDestinationUpdate"
      @update:record-date="onRecordDateUpdate"
      @submit="onSubmit"
    />
  </main>
</template>

<style scoped>
.start-page {
  align-content: start;
}

@media (min-width: 900px) {
  .start-page {
    padding-top: 48px;
  }
}
</style>
