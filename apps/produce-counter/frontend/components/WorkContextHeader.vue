<script setup lang="ts">
import { Building2, CalendarDays, LogOut, Pencil } from '@lucide/vue'
import type { CountWorkContext } from '@nexttree/shared'

defineProps<{
  context: CountWorkContext
}>()

defineEmits<{
  'change': []
  'finish': []
}>()

function displayDate(value: string): string {
  return value.replaceAll('-', '/')
}
</script>

<template>
  <section
    class="work-context"
    data-testid="work-context"
    aria-label="現在の作業情報"
  >
    <dl>
      <div>
        <dt>
          <Building2 :size="16" aria-hidden="true" />
          卸先
        </dt>
        <dd>{{ context.destinationName }}</dd>
      </div>
      <div>
        <dt>
          <CalendarDays :size="16" aria-hidden="true" />
          記録日
        </dt>
        <dd>{{ displayDate(context.recordDate) }}</dd>
      </div>
    </dl>

    <div class="context-actions">
      <button
        class="button button-quiet"
        type="button"
        data-testid="change-context"
        @click="$emit('change')"
      >
        <Pencil :size="16" aria-hidden="true" />
        変更
      </button>
      <button
        class="button button-quiet"
        type="button"
        data-testid="finish-work"
        @click="$emit('finish')"
      >
        <LogOut :size="16" aria-hidden="true" />
        作業を終了
      </button>
    </div>
  </section>
</template>

<style scoped>
.work-context {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: #edf4ef;
  border: 1px solid #b9cbbf;
  border-left: 4px solid var(--color-accent);
}

dl {
  display: flex;
  min-width: 0;
  gap: 34px;
  margin: 0;
}

dl > div {
  min-width: 0;
}

dt {
  display: flex;
  gap: 6px;
  align-items: center;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

dd {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.context-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
}

@media (max-width: 699px) {
  .work-context {
    display: grid;
    justify-content: stretch;
  }

  dl {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(120px, 0.6fr);
    gap: 14px;
    width: 100%;
  }

  .context-actions {
    width: 100%;
    justify-content: stretch;
  }

  .context-actions .button {
    flex: 1 1 0;
  }
}

@media (max-width: 399px) {
  dl {
    grid-template-columns: 1fr;
  }

  .context-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
