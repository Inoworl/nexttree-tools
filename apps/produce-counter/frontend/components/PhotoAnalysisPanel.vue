<script setup lang="ts">
import { Image as ImageIcon, ScanLine, Upload } from '@lucide/vue'
import { ref, watch } from 'vue'
import type { DemoAnalysis } from '../utils/demo-counter'

const props = defineProps<{
  productLabel: string | null
  countUnitLabel: string
  imageUrl: string | null
  fileName: string | null
  fileSizeLabel: string | null
  fileError: string | null
  analysis: DemoAnalysis | null
  isAnalyzing: boolean
  disabled: boolean
}>()

const MAX_IMAGE_HEIGHT = 620
const imagePlaneMaxWidth = ref('100%')

watch(() => props.imageUrl, () => {
  imagePlaneMaxWidth.value = '100%'
})

const emit = defineEmits<{
  'file-selected': [file: File]
  'analyze': []
  'image-loaded': [dimensions: { width: number, height: number }]
  'image-failed': []
}>()

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && !props.disabled) emit('file-selected', file)
  input.value = ''
}

function onImageLoad(event: Event) {
  const image = event.target as HTMLImageElement
  imagePlaneMaxWidth.value = `${Math.round(
    MAX_IMAGE_HEIGHT * (image.naturalWidth / image.naturalHeight),
  )}px`
  emit('image-loaded', {
    width: image.naturalWidth,
    height: image.naturalHeight,
  })
}
</script>

<template>
  <section class="tool-panel photo-panel" aria-labelledby="photo-heading">
    <div class="section-heading">
      <div>
        <p class="section-kicker">02 / 写真</p>
        <h2 id="photo-heading">写真と認識箇所</h2>
      </div>
      <span v-if="analysis" class="status-label status-label-success">
        解析済み
      </span>
    </div>

    <div class="photo-stage">
      <div v-if="!imageUrl" class="photo-empty">
        <ImageIcon :size="34" :stroke-width="1.5" aria-hidden="true" />
        <p v-if="disabled">品目を選択すると写真を追加できます</p>
        <p v-else>{{ productLabel }}の写真が選択されていません</p>
      </div>

      <figure v-else class="detection-figure">
        <div class="image-plane" :style="{ maxWidth: imagePlaneMaxWidth }">
          <img
            :src="imageUrl"
            :alt="`${fileName ?? '選択した写真'}のプレビュー`"
            @load="onImageLoad"
            @error="emit('image-failed')"
          >

          <div
            v-if="analysis"
            class="detection-layer"
            aria-hidden="true"
          >
            <span
              v-for="(detection, index) in analysis.detections"
              :key="detection.id"
              class="detection-box"
              data-detection-box
              :style="{
                left: `${detection.x}%`,
                top: `${detection.y}%`,
                width: `${detection.width}%`,
                height: `${detection.height}%`,
              }"
            >
              <span class="detection-number">{{ index + 1 }}</span>
            </span>
          </div>

          <div v-if="isAnalyzing" class="analysis-state" role="status">
            <ScanLine :size="28" aria-hidden="true" />
            <span>デモ解析中</span>
          </div>
        </div>
        <figcaption>
          <span>{{ fileName }}</span>
          <span v-if="fileSizeLabel">{{ fileSizeLabel }}</span>
        </figcaption>
      </figure>
    </div>

    <div class="photo-actions">
      <div class="file-control">
        <input
          id="produce-photo"
          class="visually-hidden file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          :disabled="disabled"
          :aria-describedby="disabled ? 'photo-disabled' : fileError ? 'photo-error' : 'photo-format'"
          @change="onFileChange"
        >
        <label
          class="button button-secondary"
          :class="{ 'is-disabled': disabled }"
          for="produce-photo"
          :aria-disabled="disabled ? 'true' : undefined"
        >
          <Upload :size="18" aria-hidden="true" />
          写真を選ぶ
        </label>
      </div>

      <button
        class="button button-primary"
        data-testid="analyze-photo"
        type="button"
        :disabled="disabled || !imageUrl || isAnalyzing"
        @click="emit('analyze')"
      >
        <ScanLine :size="18" aria-hidden="true" />
        {{ isAnalyzing ? '解析中' : analysis ? 'もう一度解析' : '解析する' }}
      </button>
    </div>

    <p v-if="disabled" id="photo-disabled" class="field-hint">
      先に品目を選択してください。
    </p>
    <p v-else id="photo-format" class="field-hint">JPEG・PNG・WebP / 10MB以下</p>
    <p v-if="fileError" id="photo-error" class="field-error" role="alert">
      {{ fileError }}
    </p>

    <p v-if="analysis" class="detection-summary" aria-live="polite">
      <strong>{{ analysis.detections.length }}{{ countUnitLabel }}</strong>の認識箇所を表示しています。
    </p>
  </section>
</template>

<style scoped>
.photo-panel {
  grid-area: photo;
  min-width: 0;
}

.photo-stage {
  display: grid;
  min-height: 360px;
  margin-top: 20px;
  overflow: hidden;
  place-items: center;
  background: #eef1ee;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.photo-empty {
  display: grid;
  gap: 12px;
  justify-items: center;
  padding: 48px 24px;
  color: var(--color-text-muted);
  text-align: center;
}

.photo-empty p {
  margin: 0;
}

.detection-figure {
  width: 100%;
  margin: 0;
}

.image-plane {
  position: relative;
  width: 100%;
  margin-inline: auto;
  line-height: 0;
}

.image-plane img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 620px;
}

.detection-layer {
  position: absolute;
  z-index: 2;
  inset: 0;
}

.detection-box {
  position: absolute;
  display: block;
  border: 3px solid #d62d20;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 88%);
}

.detection-number {
  position: absolute;
  top: -12px;
  left: -12px;
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  background: #d62d20;
  border: 2px solid #fff;
  border-radius: 50%;
  font-variant-numeric: tabular-nums;
}

.analysis-state {
  position: absolute;
  z-index: 3;
  inset: 0;
  display: grid;
  gap: 10px;
  place-content: center;
  justify-items: center;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.5;
  background: rgb(24 31 27 / 76%);
}

figcaption {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 10px 12px;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.5;
  background: #fff;
  border-top: 1px solid var(--color-border);
}

figcaption span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.file-control {
  display: contents;
}

.file-input:focus-visible + .button {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.is-disabled {
  pointer-events: none;
}

.field-hint {
  margin: 10px 0 0;
}

.detection-summary {
  margin: 16px 0 0;
  padding-top: 14px;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
}

.detection-summary strong {
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 639px) {
  .photo-stage {
    min-height: 260px;
  }

  .photo-actions .button {
    flex: 1 1 150px;
  }

  .detection-box {
    border-width: 2px;
  }
}
</style>
