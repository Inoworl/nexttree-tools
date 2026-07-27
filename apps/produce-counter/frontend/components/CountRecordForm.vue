<script setup lang="ts">
import { Calendar, Save, Store } from '@lucide/vue'
import type { CountUnit, ProductId } from '@nexttree/shared'
import { ref } from 'vue'
import type {
  CountUnitOption,
  ProductOption,
  VarietyOption,
} from '../utils/demo-counter'

export type RecordFormErrors = {
  correctedCount: string | null
  storeName: string | null
  recordDate: string | null
}

const props = defineProps<{
  productId: ProductId
  productOptions: readonly ProductOption[]
  varietyId: string
  varietyOptions: readonly VarietyOption[]
  countUnit: CountUnit
  countUnitOptions: readonly CountUnitOption[]
  countUnitLabel: string
  estimatedCount: number | null
  finalCount: number | null
  correctedCountInput: string
  storeName: string
  recordDate: string
  errors: RecordFormErrors
  saveMessage: string | null
  saveError: string | null
}>()

const emit = defineEmits<{
  'update:product-id': [value: ProductId]
  'update:variety-id': [value: string]
  'update:count-unit': [value: CountUnit]
  'update:corrected-count-input': [value: string]
  'update:store-name': [value: string]
  'update:record-date': [value: string]
  'save': []
}>()

const correctedCountElement = ref<HTMLInputElement | null>(null)
const storeNameElement = ref<HTMLInputElement | null>(null)
const recordDateElement = ref<HTMLInputElement | null>(null)

function emitSelect(
  event: Event,
  name: 'product-id' | 'variety-id' | 'count-unit',
) {
  const value = (event.target as HTMLSelectElement).value
  if (name === 'product-id') {
    emit('update:product-id', value as ProductId)
  } else if (name === 'variety-id') {
    emit('update:variety-id', value)
  } else {
    emit('update:count-unit', value as CountUnit)
  }
}

function emitInput(
  event: Event,
  name: 'corrected-count-input' | 'store-name' | 'record-date',
) {
  const value = (event.target as HTMLInputElement).value
  if (name === 'corrected-count-input') {
    emit('update:corrected-count-input', value)
  } else if (name === 'store-name') {
    emit('update:store-name', value)
  } else {
    emit('update:record-date', value)
  }
}

function focusFirstError(errors: RecordFormErrors) {
  if (errors.correctedCount) correctedCountElement.value?.focus()
  else if (errors.storeName) storeNameElement.value?.focus()
  else if (errors.recordDate) recordDateElement.value?.focus()
}

defineExpose({ focusFirstError })
</script>

<template>
  <section class="tool-panel record-panel" aria-labelledby="record-heading">
    <div class="section-heading">
      <div>
        <p class="section-kicker">02 / 確認と保存</p>
        <h2 id="record-heading">数量と記録情報</h2>
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

    <form class="record-form" novalidate @submit.prevent="emit('save')">
      <fieldset>
        <legend>対象</legend>

        <div class="configuration-grid">
          <div class="field-group">
            <label for="product-id">品目</label>
            <select
              id="product-id"
              :value="productId"
              @change="emitSelect($event, 'product-id')"
            >
              <option
                v-for="product in productOptions"
                :key="product.id"
                :value="product.id"
              >
                {{ product.label }}
              </option>
            </select>
          </div>

          <div class="field-group">
            <label for="variety-id">品種</label>
            <select
              id="variety-id"
              :value="varietyId"
              @change="emitSelect($event, 'variety-id')"
            >
              <option
                v-for="variety in varietyOptions"
                :key="variety.id"
                :value="variety.id"
              >
                {{ variety.label }}
              </option>
            </select>
          </div>

          <div class="field-group">
            <label for="count-unit">数え方</label>
            <select
              id="count-unit"
              :value="countUnit"
              @change="emitSelect($event, 'count-unit')"
            >
              <option
                v-for="unit in countUnitOptions"
                :key="unit.id"
                :value="unit.id"
              >
                {{ unit.label }}
              </option>
            </select>
          </div>
        </div>
      </fieldset>

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
          :aria-invalid="errors.correctedCount ? 'true' : undefined"
          :aria-describedby="errors.correctedCount ? 'corrected-count-error' : 'corrected-count-hint'"
          @input="emitInput($event, 'corrected-count-input')"
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

      <fieldset>
        <legend>記録情報</legend>

        <div class="field-group">
          <label for="store-name">
            <Store :size="16" aria-hidden="true" />
            店名
          </label>
          <input
            id="store-name"
            ref="storeNameElement"
            :value="storeName"
            type="text"
            maxlength="80"
            autocomplete="organization"
            required
            placeholder="例：港店"
            :aria-invalid="errors.storeName ? 'true' : undefined"
            :aria-describedby="errors.storeName ? 'store-name-error' : undefined"
            @input="emitInput($event, 'store-name')"
          >
          <p v-if="errors.storeName" id="store-name-error" class="field-error">
            {{ errors.storeName }}
          </p>
        </div>

        <div class="field-group">
          <label for="record-date">
            <Calendar :size="16" aria-hidden="true" />
            記録日
          </label>
          <input
            id="record-date"
            ref="recordDateElement"
            :value="recordDate"
            type="date"
            required
            :aria-invalid="errors.recordDate ? 'true' : undefined"
            :aria-describedby="errors.recordDate ? 'record-date-error' : 'record-date-hint'"
            @input="emitInput($event, 'record-date')"
          >
          <p id="record-date-hint" class="field-hint">
            作成日時・更新日時とは別の業務日付です。
          </p>
          <p v-if="errors.recordDate" id="record-date-error" class="field-error">
            {{ errors.recordDate }}
          </p>
        </div>
      </fieldset>

      <button
        class="button button-primary save-button"
        type="submit"
        :disabled="estimatedCount === null"
      >
        <Save :size="18" aria-hidden="true" />
        デモ記録を保存
      </button>
    </form>

    <div class="save-status" aria-live="polite" aria-atomic="true">
      <p v-if="saveMessage" class="success-message">{{ saveMessage }}</p>
      <p v-else-if="saveError" class="field-error">{{ saveError }}</p>
    </div>
  </section>
</template>

<style scoped>
.record-panel {
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
}

.configuration-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.field-group {
  display: grid;
  gap: 8px;
}

.field-group label {
  display: flex;
  gap: 7px;
  align-items: center;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 700;
}

.field-group input,
.field-group select {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  color: var(--color-text);
  font: inherit;
  background: #fff;
  border: 1px solid var(--color-control-border);
  border-radius: 5px;
}

.field-group input:hover,
.field-group select:hover {
  border-color: #6f7d73;
}

.field-group input:focus-visible,
.field-group select:focus-visible {
  border-color: var(--color-accent-strong);
  outline: 3px solid var(--color-focus);
  outline-offset: 1px;
}

.field-group input[aria-invalid="true"] {
  border-color: var(--color-danger);
}

fieldset {
  display: grid;
  gap: 20px;
  min-width: 0;
  margin: 0;
  padding: 20px 0 0;
  border: 0;
  border-top: 1px solid var(--color-border);
}

legend {
  padding: 0;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 750;
}

.save-button {
  width: 100%;
}

.save-status {
  min-height: 24px;
  margin-top: 14px;
}

.success-message {
  margin: 0;
  color: var(--color-accent-strong);
  font-weight: 700;
}

@media (max-width: 479px) {
  .configuration-grid {
    grid-template-columns: 1fr;
  }
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
