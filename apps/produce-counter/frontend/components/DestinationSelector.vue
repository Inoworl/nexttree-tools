<script setup lang="ts">
import { CalendarDays, Play, Store } from '@lucide/vue'
import { ref } from 'vue'
import type { WorkContextErrors } from '../utils/count-work-context'
import type { DestinationOption } from '../utils/destination-catalog'

const props = defineProps<{
  destinationId: string
  recordDate: string
  destinations: readonly DestinationOption[]
  errors: WorkContextErrors
  canSubmit: boolean
}>()

const emit = defineEmits<{
  'update:destination-id': [value: string]
  'update:record-date': [value: string]
  'submit': []
}>()

const destinationElement = ref<HTMLSelectElement | null>(null)
const dateElement = ref<HTMLInputElement | null>(null)

function emitValue(
  event: Event,
  name: 'destination-id' | 'record-date',
) {
  const value = (event.target as HTMLInputElement | HTMLSelectElement).value
  if (name === 'destination-id') {
    emit('update:destination-id', value)
  } else {
    emit('update:record-date', value)
  }
}

function focusFirstError(errors: WorkContextErrors) {
  if (errors.destinationId) destinationElement.value?.focus()
  else if (errors.recordDate) dateElement.value?.focus()
}

defineExpose({ focusFirstError })
</script>

<template>
  <section class="start-panel" aria-labelledby="start-heading">
    <div class="section-heading">
      <div>
        <p class="section-kicker">作業情報</p>
        <h2 id="start-heading">今回の記録先</h2>
      </div>
    </div>

    <form novalidate @submit.prevent="emit('submit')">
      <div class="field-group">
        <label for="destination-id">
          <Store :size="17" aria-hidden="true" />
          卸先
        </label>
        <select
          id="destination-id"
          ref="destinationElement"
          :value="props.destinationId"
          required
          :aria-invalid="errors.destinationId ? 'true' : undefined"
          :aria-describedby="errors.destinationId ? 'destination-error' : undefined"
          @change="emitValue($event, 'destination-id')"
        >
          <option value="" disabled>卸先を選択</option>
          <option
            v-for="destination in destinations"
            :key="destination.id"
            :value="destination.id"
          >
            {{ destination.label }}
          </option>
        </select>
        <p
          v-if="errors.destinationId"
          id="destination-error"
          class="field-error"
        >
          {{ errors.destinationId }}
        </p>
      </div>

      <div class="field-group">
        <label for="record-date">
          <CalendarDays :size="17" aria-hidden="true" />
          記録日
        </label>
        <input
          id="record-date"
          ref="dateElement"
          :value="props.recordDate"
          type="date"
          required
          :aria-invalid="errors.recordDate ? 'true' : undefined"
          :aria-describedby="errors.recordDate ? 'record-date-error' : 'record-date-hint'"
          @input="emitValue($event, 'record-date')"
        >
        <p id="record-date-hint" class="field-hint">
          作成日時・更新日時とは別の業務日付です。
        </p>
        <p v-if="errors.recordDate" id="record-date-error" class="field-error">
          {{ errors.recordDate }}
        </p>
      </div>

      <button
        class="button button-primary start-button"
        data-testid="start-counting"
        type="submit"
        :disabled="!canSubmit"
      >
        <Play :size="18" aria-hidden="true" />
        カウントを始める
      </button>
    </form>
  </section>
</template>

<style scoped>
.start-panel {
  width: min(100%, 620px);
  padding: 28px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
}

form {
  display: grid;
  gap: 22px;
  margin-top: 24px;
}

.start-button {
  width: 100%;
  margin-top: 2px;
}

@media (max-width: 639px) {
  .start-panel {
    padding: 20px 16px;
  }
}
</style>
