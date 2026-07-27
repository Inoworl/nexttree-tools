import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../app.vue'
import PhotoAnalysisPanel from '../components/PhotoAnalysisPanel.vue'

const DEMO_STORAGE_KEY = 'nexttree:produce-counter:demo:v2'

async function selectFile(wrapper: VueWrapper, file: File) {
  const input = wrapper.get<HTMLInputElement>('#produce-photo')
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

describe('農産物カウンターのUIフロー', () => {
  const createObjectURL = vi.fn<(file: File) => string>()
  const revokeObjectURL = vi.fn<(url: string) => void>()
  const useHead = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-16T03:00:00.000Z'))
    window.localStorage.clear()
    createObjectURL.mockReset()
    revokeObjectURL.mockReset()
    useHead.mockReset()
    vi.stubGlobal('useHead', useHead)
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
    vi.unstubAllGlobals()
  })

  it('ページタイトルをhead managerに登録する', () => {
    const wrapper = mount(App)

    expect(useHead).toHaveBeenCalledWith({
      title: '農産物カウンター | Next Tree',
    })
    wrapper.unmount()
  })


  it('びわ・キウイ・栗と全品種を選択肢として表示する', async () => {
    const wrapper = mount(App)
    const optionValues = (selector: string) => wrapper
      .findAll<HTMLSelectElement>(`${selector} option`)
      .map(option => option.element.value)

    expect(optionValues('#product-id')).toEqual(['loquat', 'kiwi', 'chestnut'])
    expect(optionValues('#variety-id')).toEqual(['mogi', 'tanaka'])

    await wrapper.get('#product-id').setValue('kiwi')
    expect(optionValues('#variety-id')).toEqual(['hayward', 'gold'])

    await wrapper.get('#product-id').setValue('chestnut')
    expect(optionValues('#variety-id')).toEqual(['tsukuba', 'ginyose'])
    wrapper.unmount()
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
        productLabel: 'びわ',
        countUnitLabel: 'パック',
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

  it('商品と品種の変更で既定単位へ切り替えて解析結果を無効化する', async () => {
    const wrapper = mount(App, { attachTo: document.body })
    const estimatedCount = () => wrapper.get('[data-testid="estimated-count"]').text()
    const finalCount = () => wrapper.get('[data-testid="final-count"]').text()
    const saveButton = () => wrapper.get<HTMLButtonElement>('button[type="submit"]')
    const correctedInput = () => wrapper.get<HTMLInputElement>('#corrected-count')
    const expectAnalysisReset = () => {
      expect(wrapper.findAll('[data-detection-box]')).toHaveLength(0)
      expect(estimatedCount()).toContain('--')
      expect(finalCount()).toContain('--')
      expect(correctedInput().element.value).toBe('')
      expect(saveButton().element.disabled).toBe(true)
    }

    expect(wrapper.get<HTMLSelectElement>('#product-id').element.value).toBe('loquat')
    expect(wrapper.get<HTMLSelectElement>('#variety-id').element.value).toBe('mogi')
    expect(wrapper.get<HTMLSelectElement>('#count-unit').element.value).toBe('pack')

    await selectFile(
      wrapper,
      new File(['valid-image'], 'produce.png', { type: 'image/png' }),
    )
    await finishAnalysis(wrapper)
    await correctedInput().setValue('10')
    expect(estimatedCount()).toContain('9パック')

    await wrapper.get('#product-id').setValue('kiwi')
    expect(wrapper.get<HTMLSelectElement>('#variety-id').element.value).toBe('hayward')
    expect(wrapper.get<HTMLSelectElement>('#count-unit').element.value).toBe('piece')
    expectAnalysisReset()

    await finishAnalysis(wrapper)
    await correctedInput().setValue('10')
    await wrapper.get('#count-unit').setValue('box')
    expectAnalysisReset()

    await finishAnalysis(wrapper)
    await correctedInput().setValue('10')
    await wrapper.get('#variety-id').setValue('gold')
    expect(wrapper.get<HTMLSelectElement>('#count-unit').element.value).toBe('piece')
    expectAnalysisReset()

    await finishAnalysis(wrapper)
    await correctedInput().setValue('10')
    await wrapper.get('#count-unit').setValue('box')
    expectAnalysisReset()

    await finishAnalysis(wrapper)
    expect(estimatedCount()).toContain('9箱')
    wrapper.unmount()
  })

  it('修正値0と独立した記録日をブラウザへ保存する', async () => {
    const wrapper = mount(App, { attachTo: document.body })
    await selectFile(
      wrapper,
      new File(['valid-image'], 'produce.webp', { type: 'image/webp' }),
    )
    await wrapper.get('#product-id').setValue('kiwi')
    await wrapper.get('#variety-id').setValue('gold')
    await wrapper.get('#count-unit').setValue('box')
    await finishAnalysis(wrapper)
    vi.setSystemTime(new Date('2026-07-16T03:00:00.000Z'))

    await wrapper.get('#corrected-count').setValue('0')
    await wrapper.get('#store-name').setValue('中央店')
    await wrapper.get('#record-date').setValue('2026-07-01')
    expect(wrapper.get('[data-testid="estimated-count"]').text()).toContain('9箱')
    expect(wrapper.get('[data-testid="final-count"]').text()).toContain('0箱')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const stored = JSON.parse(window.localStorage.getItem(DEMO_STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({
      schemaVersion: 2,
      productId: 'kiwi',
      productLabel: 'キウイ',
      varietyId: 'gold',
      varietyLabel: 'ゴールド',
      countUnit: 'box',
      countUnitLabel: '箱',
      storeName: '中央店',
      recordDate: '2026-07-01',
      estimatedCount: 9,
      correctedCount: 0,
      finalCount: 0,
    })
    expect(stored[0].createdAt).toBe('2026-07-16T03:00:00.000Z')
    expect(stored[0].updatedAt).toBe('2026-07-16T03:00:00.000Z')
    expect(window.localStorage.getItem(DEMO_STORAGE_KEY)).not.toMatch(/blob:|data:image/i)
    const recentRecordText = wrapper.get('[data-testid="recent-record"]').text()
    expect(recentRecordText).toContain('キウイ / ゴールド')
    expect(recentRecordText).toContain('9箱')
    expect(recentRecordText).toContain('0箱')
    wrapper.unmount()
  })


  it('現在のマスタにない保存済み履歴もスナップショット表示する', async () => {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify([{
      schemaVersion: 2,
      source: 'demo',
      id: 'legacy-record',
      productId: 'retired-product',
      productLabel: '旧商品',
      varietyId: 'retired-variety',
      varietyLabel: '旧品種',
      countUnit: 'bundle',
      countUnitLabel: '束',
      fileName: 'legacy.jpg',
      storeName: '旧店舗',
      recordDate: '2026-06-30',
      estimatedCount: 6,
      correctedCount: 7,
      finalCount: 7,
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
    }]))

    const wrapper = mount(App)
    await flushPromises()
    const recentRecordText = wrapper.get('[data-testid="recent-record"]').text()
    expect(recentRecordText).toContain('旧商品 / 旧品種')
    expect(recentRecordText).toContain('6束')
    expect(recentRecordText).toContain('7束')
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
