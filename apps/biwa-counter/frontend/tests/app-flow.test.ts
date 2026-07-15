import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../app.vue'
import PhotoAnalysisPanel from '../components/PhotoAnalysisPanel.vue'

const DEMO_STORAGE_KEY = 'nexttree:biwa-counter:demo:v1'

async function selectFile(wrapper: VueWrapper, file: File) {
  const input = wrapper.get<HTMLInputElement>('#biwa-photo')
  Object.defineProperty(input.element, 'files', {
    configurable: true,
    value: [file],
  })
  await input.trigger('change')
}

async function finishAnalysis(wrapper: VueWrapper) {
  await wrapper.get<HTMLButtonElement>('.photo-actions .button-primary').trigger('click')
  await vi.advanceTimersByTimeAsync(650)
  await flushPromises()
}

describe('びわカウンターのUIフロー', () => {
  const createObjectURL = vi.fn<(file: File) => string>()
  const revokeObjectURL = vi.fn<(url: string) => void>()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-16T03:00:00.000Z'))
    window.localStorage.clear()
    createObjectURL.mockReset()
    revokeObjectURL.mockReset()
    createObjectURL.mockImplementation(file => `blob:${file.name}`)
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    })
    Object.defineProperty(window.crypto, 'randomUUID', {
      configurable: true,
      value: vi.fn(() => '00000000-0000-4000-8000-000000000001'),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('不正ファイルを拒否しても保持中の有効な写真を再解析できる', async () => {
    const wrapper = mount(App, { attachTo: document.body })

    await selectFile(
      wrapper,
      new File(['valid-image'], 'biwa.png', { type: 'image/png' }),
    )
    await selectFile(
      wrapper,
      new File(['invalid'], 'document.pdf', { type: 'application/pdf' }),
    )

    expect(wrapper.get('[role="alert"]').text()).toBe(
      'JPEG、PNG、WebPの画像を選択してください。',
    )
    expect(wrapper.get('img').attributes('alt')).toBe('biwa.pngのプレビュー')

    await finishAnalysis(wrapper)

    expect(wrapper.findAll('[data-detection-box]')).toHaveLength(9)
    expect(wrapper.get('[data-testid="estimated-count"]').text()).toContain('9')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('縦長画像の表示面を画像比率に合わせて赤枠の基準面を限定する', async () => {
    const wrapper = mount(PhotoAnalysisPanel, {
      props: {
        imageUrl: 'blob:portrait.png',
        fileName: 'portrait.png',
        fileSizeLabel: '1.0 MB',
        fileError: null,
        analysis: null,
        isAnalyzing: false,
      },
    })
    const image = wrapper.get<HTMLImageElement>('img')
    Object.defineProperty(image.element, 'naturalWidth', { value: 900 })
    Object.defineProperty(image.element, 'naturalHeight', { value: 1200 })

    await image.trigger('load')

    expect(wrapper.get<HTMLElement>('.image-plane').element.style.maxWidth).toBe(
      '465px',
    )
    wrapper.unmount()
  })

  it('修正値0と独立した記録日をブラウザへ保存する', async () => {
    const wrapper = mount(App, { attachTo: document.body })
    await selectFile(
      wrapper,
      new File(['valid-image'], 'biwa.webp', { type: 'image/webp' }),
    )
    await finishAnalysis(wrapper)
    vi.setSystemTime(new Date('2026-07-16T03:00:00.000Z'))

    await wrapper.get('#corrected-count').setValue('0')
    await wrapper.get('#store-name').setValue('中央店')
    await wrapper.get('#record-date').setValue('2026-07-01')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const stored = JSON.parse(window.localStorage.getItem(DEMO_STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({
      storeName: '中央店',
      recordDate: '2026-07-01',
      estimatedCount: 9,
      correctedCount: 0,
      finalCount: 0,
    })
    expect(stored[0].createdAt).toBe('2026-07-16T03:00:00.000Z')
    expect(stored[0].updatedAt).toBe('2026-07-16T03:00:00.000Z')
    expect(window.localStorage.getItem(DEMO_STORAGE_KEY)).not.toMatch(/blob:|data:image/i)
    wrapper.unmount()
  })

  it('保存エラー時は最初の不正項目へフォーカスする', async () => {
    const wrapper = mount(App, { attachTo: document.body })
    await selectFile(
      wrapper,
      new File(['valid-image'], 'biwa.jpg', { type: 'image/jpeg' }),
    )
    await finishAnalysis(wrapper)

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('#store-name-error').text()).toBe('店名を入力してください。')
    expect(document.activeElement).toBe(wrapper.get('#store-name').element)
    wrapper.unmount()
  })

  it('写真の交換時とアンマウント時にObject URLを解放する', async () => {
    const wrapper = mount(App, { attachTo: document.body })
    await selectFile(
      wrapper,
      new File(['first'], 'first.png', { type: 'image/png' }),
    )
    await selectFile(
      wrapper,
      new File(['second'], 'second.png', { type: 'image/png' }),
    )

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:first.png')
    wrapper.unmount()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:second.png')
  })
})
