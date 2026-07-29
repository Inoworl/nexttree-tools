<script setup lang="ts">
import { CircleCheck, LogOut, Plus, Save } from '@lucide/vue'
import { ref } from 'vue'

export type RecordFormErrors = {
  correctedCount: string | null
}

defineProps<{
  countUnitLabel: string
  estimatedCount: number | null
  finalCount: number | null
  correctedCountInput: string
  errors: RecordFormErrors
  saveMessage: string | null
  saveError: string | null
  isSaved: boolean
}>()

const emit = defineEmits<{
  'update:corrected-count-input': [value: string]
  'save': []
  'start-next': []
  'finish': []
}>()

const correctedCountElement = ref<HTMLInputElement | null>(null)

function onInput(event: Event) {
  emit(
    'update:corrected-count-input',
    (event.target as HTMLInputElement).value,
  )
}

function focusFirstError(errors: RecordFormErrors) {
  if (errors.correctedCount) correctedCountElement.value?.focus()
}

defineExpose({ focusFirstError })
</script>

<template>
  <section class="tool-panel record-panel" aria-labelledby="record-heading">
    <div class="section-heading">
      <div>
        <p class="section-kicker">03 / 数量</p>
        <h2 id="record-heading">確認と保存</h2>
      </div>
    </div>

    <dl class="count-summary">
      <div>
        <dt>デモ推定数</dt>
        <dd data-testid="estimated-count">
          <template v-if="estimatedCount !== null">
            {{ estimatedCount }}<span>{{ countUnitLabel }}</span>
          </template>
          <template v-else>--</template>
        </dd>
      </div>
      <div class="count-final">
        <dt>記録する数</dt>
        <dd data-testid="final-count">
          <template v-if="finalCount !== null">
            {{ finalCount }}<span>{{ countUnitLabel }}</span>
          </template>
          <template v-else>--</template>
        </dd>
      </div>
    </dl>

    <div v-if="isSaved" class="saved-state" data-testid="save-actions">
      <div class="saved-message" role="status">
        <CircleCheck :size="22" aria-hidden="true" />
        <p>{{ saveMessage }}</p>
      </div>
      <div class="saved-actions">
        <button
          class="button button-primary"
          data-testid="start-next-record"
          type="button"
          @click="emit('start-next')"
        >
          <Plus :size="18" aria-hidden="true" />
          同じ卸先で次を登録
        </button>
        <button
          class="button button-secondary"
          data-testid="finish-after-save"
          type="button"
          @click="emit('finish')"
        >
          <LogOut :size="18" aria-hidden="true" />
          作業を終了
        </button>
      </div>
    </div>

    <form v-else class="record-form" novalidate @submit.prevent="emit('save')">
      <div class="field-group">
        <label for="corrected-count">人間による修正数</label>
        <input
          id="corrected-count"
          ref="correctedCountElement"
          :value="correctedCountInput"
          type="number"
          inputmode="numeric"
          min="0"
          step="1"
          placeholder="漏れがある場合に入力"
          :disabled="estimatedCount === null"
          :aria-invalid="errors.correctedCount ? 'true' : undefined"
          :aria-describedby="errors.correctedCount ? 'corrected-count-error' : 'corrected-count-hint'"
          @input="onInput"
        >
        <p id="corrected-count-hint" class="field-hint">
          空欄の場合はデモ推定数を使用します。
        </p>
        <p
          v-if="errors.correctedCount"
          id="corrected-count-error"
          class="field-error"
        >
          {{ errors.correctedCount }}
        </p>
      </div>

      <button
        class="button button-primary save-button"
        type="submit"
        :disabled="estimatedCount === null"
      >
        <Save :size="18" aria-hidden="true" />
        デモ記録を保存
      </button>
    </form>

    <div v-if="!isSaved" class="save-status" aria-live="polite" aria-atomic="true">
      <p v-if="saveMessage" class="success-message">{{ saveMessage }}</p>
      <p v-else-if="saveError" class="field-error">{{ saveError }}</p>
    </div>
  </section>
</template>

<style scoped>
.record-panel {
  grid-area: record;
  align-self: start;
}

.count-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 20px 0 0;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.count-summary > div {
  min-width: 0;
  padding: 16px;
}

.count-summary > div + div {
  border-left: 1px solid var(--color-border);
}

.count-summary dt {
  color: var(--color-text-muted);
  font-size: 13px;
}

.count-summary dd {
  margin: 4px 0 0;
  color: var(--color-text);
  font-size: clamp(28px, 6vw, 38px);
  font-weight: 750;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.count-summary dd span {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 600;
}

.count-final {
  background: #edf6f0;
}

.count-final dd {
  color: var(--color-accent-strong);
}

.record-form {
  display: grid;
  gap: 22px;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid var(--color-border);
}

.save-button {
  width: 100%;
}

.save-status {
  min-height: 22px;
  margin-top: 12px;
}

.success-message {
  margin: 0;
  color: var(--color-accent-strong);
  font-weight: 700;
}

.saved-state {
  display: grid;
  gap: 18px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.saved-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: var(--color-accent-strong);
  font-weight: 750;
}

.saved-message p {
  margin: 0;
  line-height: 1.55;
}

.saved-actions {
  display: grid;
  gap: 10px;
}

@media (max-width: 359px) {
  .count-summary {
    grid-template-columns: 1fr;
  }

  .count-summary > div + div {
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }
}
</style>
