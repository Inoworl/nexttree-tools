<script setup lang="ts">
import { CircleCheck, History } from '@lucide/vue'
import type { DemoCountRecord } from '../utils/demo-counter'

defineProps<{
  records: DemoCountRecord[]
}>()

function displayDate(value: string): string {
  return value.replaceAll('-', '/')
}
</script>

<template>
  <section class="records-section" aria-labelledby="records-heading">
    <div class="records-heading">
      <div>
        <p class="section-kicker">04 / 保存履歴</p>
        <h2 id="records-heading">最近の記録</h2>
      </div>
      <span class="record-count">{{ records.length }}件</span>
    </div>

    <div v-if="records.length === 0" class="records-empty">
      <History :size="26" :stroke-width="1.5" aria-hidden="true" />
      <p>保存されたデモ記録はありません。</p>
    </div>

    <ol v-else class="record-list">
      <li v-for="record in records" :key="record.id">
        <article class="record-item" data-testid="recent-record">
          <header>
            <div>
              <p class="record-store">{{ record.destinationName }}</p>
              <time :datetime="record.recordDate">
                {{ displayDate(record.recordDate) }}
              </time>
            </div>
            <span class="record-final">
              <CircleCheck :size="18" aria-hidden="true" />
              {{ record.finalCount }}{{ record.countUnitLabel }}
            </span>
          </header>

          <dl>
            <div>
              <dt>品目・品種</dt>
              <dd>{{ record.productLabel }} / {{ record.varietyLabel }}</dd>
            </div>
            <div>
              <dt>デモ推定</dt>
              <dd>{{ record.estimatedCount }}{{ record.countUnitLabel }}</dd>
            </div>
            <div>
              <dt>人間の修正</dt>
              <dd>
                {{ record.correctedCount === null
                  ? '未修正'
                  : `${record.correctedCount}${record.countUnitLabel}` }}
              </dd>
            </div>
            <div class="record-file">
              <dt>写真</dt>
              <dd :title="record.fileName">{{ record.fileName }}</dd>
            </div>
          </dl>
        </article>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.records-section {
  padding-top: 34px;
  border-top: 1px solid var(--color-border-strong);
}

.records-heading {
  display: flex;
  gap: 16px;
  align-items: end;
  justify-content: space-between;
}

.record-count {
  color: var(--color-text-muted);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.records-empty {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 18px;
  padding: 24px 0;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.records-empty p {
  margin: 0;
}

.record-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.record-item {
  height: 100%;
  padding: 18px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.record-item header {
  display: flex;
  gap: 16px;
  align-items: start;
  justify-content: space-between;
}

.record-store {
  margin: 0;
  color: var(--color-text);
  font-size: 17px;
  font-weight: 750;
  overflow-wrap: anywhere;
}

time {
  display: block;
  margin-top: 3px;
  color: var(--color-text-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.record-final {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 6px;
  align-items: center;
  color: var(--color-accent-strong);
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.record-item dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.record-item dt {
  color: var(--color-text-muted);
  font-size: 12px;
}

.record-item dd {
  margin: 3px 0 0;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.record-file {
  grid-column: 1 / -1;
  min-width: 0;
}

.record-file dd {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 767px) {
  .record-list {
    grid-template-columns: 1fr;
  }
}
</style>
