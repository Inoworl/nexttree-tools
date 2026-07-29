<script setup lang="ts">
import { Sprout } from '@lucide/vue'

useHead({
  htmlAttrs: { lang: 'ja' },
})
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <NuxtLink
          class="brand"
          to="/count/new"
          aria-label="農産物カウンターの作業開始画面へ"
        >
          <span class="brand-mark" aria-hidden="true">
            <Sprout :size="22" />
          </span>
          <span>農産物カウンター</span>
        </NuxtLink>
        <span class="demo-badge">UI確認用デモ</span>
      </div>
    </header>

    <slot />

    <footer class="app-footer">
      <p>Next Tree / produce-counter demo</p>
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
  background: var(--color-canvas);
}

body {
  margin: 0;
  color: var(--color-text);
  background: var(--color-canvas);
}

button,
input,
select {
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
  gap: 24px;
  min-height: calc(100dvh - 123px);
  padding-block: 36px 52px;
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
  max-width: 680px;
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
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
  background: #fff;
  border: 1px solid var(--color-control-border);
  border-radius: 5px;
}

.field-group input:hover,
.field-group select:hover {
  border-color: #455148;
}

.field-group input:focus-visible,
.field-group select:focus-visible {
  border-color: var(--color-accent-strong);
  outline: 3px solid var(--color-focus);
  outline-offset: 1px;
}

.field-group input[aria-invalid="true"],
.field-group select[aria-invalid="true"] {
  border-color: var(--color-danger);
}

.field-group input:disabled,
.field-group select:disabled {
  color: #69736c;
  cursor: not-allowed;
  background: #eef1ef;
}

.button {
  display: inline-flex;
  min-height: 44px;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 750;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  background: #fff;
  border: 1px solid transparent;
  border-radius: 5px;
}

.button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.button:disabled,
.button[aria-disabled="true"] {
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
  background: #fff;
  border-color: var(--color-control-border);
}

.button-secondary:not(:disabled):hover {
  background: #f0f3f1;
}

.button-quiet {
  color: var(--color-accent-strong);
  background: transparent;
  border-color: var(--color-border-strong);
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
    padding-block: 26px 40px;
  }

  h1 {
    font-size: 29px;
  }

  .tool-panel {
    padding: 16px;
  }
}
</style>
