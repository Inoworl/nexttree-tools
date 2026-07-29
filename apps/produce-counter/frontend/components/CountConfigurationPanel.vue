<script setup lang="ts">
import { PackageSearch } from '@lucide/vue'
import type { CountUnit, ProductId } from '@nexttree/shared'
import { ref } from 'vue'
import type {
  CountUnitOption,
  ProductOption,
  VarietyOption,
} from '../utils/demo-counter'

defineProps<{
  productId: ProductId | ''
  productOptions: readonly ProductOption[]
  varietyId: string
  varietyOptions: readonly VarietyOption[]
  countUnit: CountUnit | ''
  countUnitOptions: readonly CountUnitOption[]
}>()

const emit = defineEmits<{
  'update:product-id': [value: ProductId]
  'update:variety-id': [value: string]
  'update:count-unit': [value: CountUnit]
}>()

const productElement = ref<HTMLSelectElement | null>(null)

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

function focusProduct() {
  productElement.value?.focus()
}

defineExpose({ focusProduct })
</script>

<template>
  <section class="tool-panel configuration-panel" aria-labelledby="configuration-heading">
    <div class="section-heading">
      <div>
        <p class="section-kicker">01 / 対象</p>
        <h2 id="configuration-heading">品目と数え方</h2>
      </div>
      <PackageSearch :size="21" aria-hidden="true" />
    </div>

    <div class="configuration-fields">
      <div class="field-group">
        <label for="product-id">品目</label>
        <select
          id="product-id"
          ref="productElement"
          :value="productId"
          @change="emitSelect($event, 'product-id')"
        >
          <option value="" disabled>品目を選択</option>
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
          :disabled="!productId"
          @change="emitSelect($event, 'variety-id')"
        >
          <option value="" disabled>品種を選択</option>
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
          :disabled="!productId"
          @change="emitSelect($event, 'count-unit')"
        >
          <option value="" disabled>単位を選択</option>
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
  </section>
</template>

<style scoped>
.configuration-panel {
  grid-area: configuration;
  align-self: start;
}

.section-heading > svg {
  color: var(--color-accent-strong);
}

.configuration-fields {
  display: grid;
  gap: 18px;
  margin-top: 22px;
}
</style>
