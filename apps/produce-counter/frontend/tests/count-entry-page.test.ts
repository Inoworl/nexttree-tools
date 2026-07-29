import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routeGuardState = vi.hoisted(() => ({
  callbacks: [] as Array<() => boolean>,
  updateCallbacks: [] as Array<
    (to: { query: Record<string, unknown> }) => boolean | string
  >,
}))

import CountEntryPage from '../pages/count/entry.vue'
import PhotoAnalysisPanel from '../components/PhotoAnalysisPanel.vue'
import { DEMO_STORAGE_KEY } from '../utils/demo-record-storage'

async function selectFile(wrapper: VueWrapper, file: File) {
  const input = wrapper.get<HTMLInputElement>('#produce-photo')
  Object.defineProperty(input.element, 'files', {
    configurable: true,
    value: [file],
  })
  await input.trigger('change')
}

async function finishAnalysis(wrapper: VueWrapper) {
  await wrapper
    .get<HTMLButtonElement>('[data-testid="analyze-photo"]')
    .trigger('click')
  await vi.advanceTimersByTimeAsync(650)
  await flushPromises()
}

async function mountEntryPage(attachToDocument = false) {
  const wrapper = mount(
    CountEntryPage,
    attachToDocument ? { attachTo: document.body } : undefined,
  )
  await flushPromises()
  return wrapper
}

describe('カウント入力ページ', () => {
  const navigateTo = vi.fn()
  const useHead = vi.fn()
  const createObjectURL = vi.fn<(file: File) => string>()
  const revokeObjectURL = vi.fn<(url: string) => void>()
  const confirm = vi.fn(() => true)
  let routeQuery: Record<string, unknown>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-30T03:00:00.000Z'))
    window.localStorage.clear()
    routeGuardState.callbacks.length = 0
    routeGuardState.updateCallbacks.length = 0
    routeQuery = {
      destinationId: 'central-market',
      recordDate: '2026-07-29',
    }
    navigateTo.mockReset()
    useHead.mockReset()
    createObjectURL.mockReset()
    revokeObjectURL.mockReset()
    confirm.mockReset()
    confirm.mockReturnValue(true)
    createObjectURL.mockImplementation(file => `blob:${file.name}`)
    vi.stubGlobal('useRoute', () => ({ query: routeQuery }))
    vi.stubGlobal('navigateTo', navigateTo)
    vi.stubGlobal('useHead', useHead)
    vi.stubGlobal('confirm', confirm)
    vi.stubGlobal('onBeforeRouteLeave', (callback: () => boolean) => {
      routeGuardState.callbacks.push(callback)
    })
    vi.stubGlobal(
      'onBeforeRouteUpdate',
      (
        callback: (
          to: { query: Record<string, unknown> },
        ) => boolean | string,
      ) => {
        routeGuardState.updateCallbacks.push(callback)
      },
    )
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

  it('不正な作業コンテキストでは開始ページへ戻す', async () => {
    routeQuery = {
      destinationId: 'unknown',
      recordDate: '2026-07-29',
    }

    const wrapper = await mountEntryPage()

    expect(navigateTo).toHaveBeenCalledWith('/count/new', { replace: true })
    expect(wrapper.find('[data-testid="count-workspace"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('ページタイトルをhead managerへ登録する', async () => {
    const wrapper = await mountEntryPage()

    expect(useHead).toHaveBeenCalledWith({
      title: 'カウント入力 | 農産物カウンター',
    })
    wrapper.unmount()
  })

  it('卸先と記録日を表示し、品目選択まで写真操作を無効にする', async () => {
    const wrapper = await mountEntryPage()

    expect(wrapper.get('[data-testid="work-context"]').text()).toContain(
      '中央青果市場（デモ）',
    )
    expect(wrapper.get('[data-testid="work-context"]').text()).toContain(
      '2026/07/29',
    )
    expect(wrapper.get<HTMLSelectElement>('#product-id').element.value).toBe('')
    expect(wrapper.get<HTMLSelectElement>('#variety-id').element.disabled).toBe(
      true,
    )
    expect(wrapper.get<HTMLSelectElement>('#count-unit').element.disabled).toBe(
      true,
    )
    expect(wrapper.get<HTMLInputElement>('#produce-photo').element.disabled).toBe(
      true,
    )
    wrapper.unmount()
  })

  it('品目選択時に既定品種・単位を設定して写真を選べる', async () => {
    const wrapper = await mountEntryPage()

    await wrapper.get('#product-id').setValue('kiwi')

    expect(wrapper.get<HTMLSelectElement>('#variety-id').element.value).toBe(
      'hayward',
    )
    expect(wrapper.get<HTMLSelectElement>('#count-unit').element.value).toBe(
      'piece',
    )
    expect(wrapper.get<HTMLInputElement>('#produce-photo').element.disabled).toBe(
      false,
    )
    wrapper.unmount()
  })

  it('全品目を表示し、品目ごとの全品種へ切り替えられる', async () => {
    const wrapper = await mountEntryPage()
    const optionValues = (selector: string) => wrapper
      .findAll<HTMLSelectElement>(`${selector} option`)
      .map(option => option.element.value)

    expect(optionValues('#product-id')).toEqual([
      '',
      'loquat',
      'kiwi',
      'chestnut',
    ])

    await wrapper.get('#product-id').setValue('kiwi')
    expect(optionValues('#variety-id')).toEqual(['', 'hayward', 'gold'])

    await wrapper.get('#product-id').setValue('chestnut')
    expect(optionValues('#variety-id')).toEqual(['', 'tsukuba', 'ginyose'])
    wrapper.unmount()
  })

  it('不正ファイルを拒否しても保持中の有効な写真を再解析できる', async () => {
    const wrapper = await mountEntryPage()
    await wrapper.get('#product-id').setValue('loquat')
    await selectFile(
      wrapper,
      new File(['valid-image'], 'loquat.png', { type: 'image/png' }),
    )
    await selectFile(
      wrapper,
      new File(['invalid'], 'document.pdf', { type: 'application/pdf' }),
    )

    expect(wrapper.get('[role="alert"]').text()).toBe(
      'JPEG、PNG、WebPの画像を選択してください。',
    )
    expect(wrapper.get('img').attributes('alt')).toBe(
      'loquat.pngのプレビュー',
    )

    await finishAnalysis(wrapper)

    expect(wrapper.findAll('[data-detection-box]')).toHaveLength(9)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('商品設定の変更で既定値へ切り替えて解析結果を無効化する', async () => {
    const wrapper = await mountEntryPage()
    const expectAnalysisReset = () => {
      expect(wrapper.findAll('[data-detection-box]')).toHaveLength(0)
      expect(wrapper.get('[data-testid="estimated-count"]').text()).toContain(
        '--',
      )
      expect(
        wrapper.get<HTMLInputElement>('#corrected-count').element.value,
      ).toBe('')
      expect(
        wrapper.get<HTMLButtonElement>('button[type="submit"]').element.disabled,
      ).toBe(true)
    }
    await wrapper.get('#product-id').setValue('loquat')
    await selectFile(
      wrapper,
      new File(['valid-image'], 'produce.png', { type: 'image/png' }),
    )
    await finishAnalysis(wrapper)
    await wrapper.get('#corrected-count').setValue('10')

    await wrapper.get('#product-id').setValue('kiwi')

    expect(wrapper.get<HTMLSelectElement>('#variety-id').element.value).toBe(
      'hayward',
    )
    expect(wrapper.get<HTMLSelectElement>('#count-unit').element.value).toBe(
      'piece',
    )
    expectAnalysisReset()

    await finishAnalysis(wrapper)
    await wrapper.get('#corrected-count').setValue('10')
    await wrapper.get('#count-unit').setValue('box')
    expectAnalysisReset()

    await finishAnalysis(wrapper)
    await wrapper.get('#corrected-count').setValue('10')
    await wrapper.get('#variety-id').setValue('gold')
    expect(wrapper.get<HTMLSelectElement>('#count-unit').element.value).toBe(
      'piece',
    )
    expectAnalysisReset()
    wrapper.unmount()
  })

  it('卸先スナップショットと修正値0をv3記録へ保存する', async () => {
    const wrapper = await mountEntryPage(true)
    await wrapper.get('#product-id').setValue('kiwi')
    await wrapper.get('#variety-id').setValue('gold')
    await wrapper.get('#count-unit').setValue('box')
    await selectFile(
      wrapper,
      new File(['valid-image'], 'produce.webp', { type: 'image/webp' }),
    )
    await finishAnalysis(wrapper)
    await wrapper.get('#corrected-count').setValue('0')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const stored = JSON.parse(
      window.localStorage.getItem(DEMO_STORAGE_KEY) ?? '[]',
    )
    expect(stored[0]).toMatchObject({
      schemaVersion: 3,
      destinationId: 'central-market',
      destinationName: '中央青果市場（デモ）',
      recordDate: '2026-07-29',
      productId: 'kiwi',
      productLabel: 'キウイ',
      varietyId: 'gold',
      varietyLabel: 'ゴールド',
      countUnit: 'box',
      countUnitLabel: '箱',
      estimatedCount: 9,
      correctedCount: 0,
      finalCount: 0,
    })
    expect(wrapper.get('[data-testid="save-actions"]').text()).toContain(
      '同じ卸先で次を登録',
    )
    expect(wrapper.get('[data-testid="recent-record"]').text()).toContain(
      '中央青果市場（デモ）',
    )
    const guard = routeGuardState.callbacks.at(-1)
    confirm.mockReturnValue(false)
    expect(guard?.()).toBe(true)
    expect(confirm).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('次件登録では卸先と日付を保ち、商品と写真をリセットする', async () => {
    const wrapper = await mountEntryPage()
    await wrapper.get('#product-id').setValue('loquat')
    await selectFile(
      wrapper,
      new File(['valid-image'], 'loquat.png', { type: 'image/png' }),
    )
    await finishAnalysis(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    await wrapper.get('[data-testid="start-next-record"]').trigger('click')

    expect(wrapper.get('[data-testid="work-context"]').text()).toContain(
      '中央青果市場（デモ）',
    )
    expect(wrapper.get<HTMLSelectElement>('#product-id').element.value).toBe('')
    expect(wrapper.get<HTMLInputElement>('#produce-photo').element.disabled).toBe(
      true,
    )
    expect(wrapper.find('img').exists()).toBe(false)
    expect(navigateTo).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('作業終了で開始ページへ戻る', async () => {
    const wrapper = await mountEntryPage()

    await wrapper.get('[data-testid="finish-work"]').trigger('click')

    expect(navigateTo).toHaveBeenCalledWith('/count/new')
    wrapper.unmount()
  })

  it('未保存写真がある場合だけページ離脱を確認する', async () => {
    const wrapper = await mountEntryPage()
    const guard = routeGuardState.callbacks.at(-1)
    expect(guard).toBeDefined()
    expect(guard?.()).toBe(true)
    expect(confirm).not.toHaveBeenCalled()

    await wrapper.get('#product-id').setValue('loquat')
    expect(guard?.()).toBe(true)
    expect(confirm).not.toHaveBeenCalled()

    await selectFile(
      wrapper,
      new File(['valid-image'], 'loquat.png', { type: 'image/png' }),
    )
    confirm.mockReturnValue(false)

    expect(guard?.()).toBe(false)
    expect(confirm).toHaveBeenCalledWith(
      '保存していない作業内容があります。移動してもよろしいですか？',
    )
    wrapper.unmount()
  })

  it('未保存写真がある場合だけbeforeunloadを抑止する', async () => {
    const wrapper = await mountEntryPage()
    const cleanEvent = new Event('beforeunload', {
      cancelable: true,
    }) as BeforeUnloadEvent
    window.dispatchEvent(cleanEvent)
    expect(cleanEvent.defaultPrevented).toBe(false)

    await wrapper.get('#product-id').setValue('loquat')
    await selectFile(
      wrapper,
      new File(['valid-image'], 'loquat.png', { type: 'image/png' }),
    )
    const dirtyEvent = new Event('beforeunload', {
      cancelable: true,
    }) as BeforeUnloadEvent
    window.dispatchEvent(dirtyEvent)

    expect(dirtyEvent.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('同一ページの有効なクエリ更新で作業コンテキストを切り替える', async () => {
    const wrapper = await mountEntryPage()
    const updateGuard = routeGuardState.updateCallbacks.at(-1)
    expect(updateGuard).toBeDefined()

    expect(updateGuard?.({
      query: {
        destinationId: 'harbor-store',
        recordDate: '2026-07-28',
      },
    })).toBe(true)
    await flushPromises()

    expect(wrapper.get('[data-testid="work-context"]').text()).toContain(
      '港青果店（デモ）',
    )
    expect(wrapper.get('[data-testid="work-context"]').text()).toContain(
      '2026/07/28',
    )
    wrapper.unmount()
  })

  it('未保存写真がある場合は同一ページのクエリ更新も中止できる', async () => {
    const wrapper = await mountEntryPage()
    await wrapper.get('#product-id').setValue('loquat')
    await selectFile(
      wrapper,
      new File(['valid-image'], 'loquat.png', { type: 'image/png' }),
    )
    confirm.mockReturnValue(false)
    const updateGuard = routeGuardState.updateCallbacks.at(-1)

    expect(updateGuard?.({
      query: {
        destinationId: 'direct-shop',
        recordDate: '2026-07-28',
      },
    })).toBe(false)
    expect(wrapper.get('[data-testid="work-context"]').text()).toContain(
      '中央青果市場（デモ）',
    )
    expect(wrapper.find('img').exists()).toBe(true)
    wrapper.unmount()
  })

  it('同一ページの不正なクエリ更新は開始ページへ戻す', async () => {
    const wrapper = await mountEntryPage()
    const updateGuard = routeGuardState.updateCallbacks.at(-1)

    expect(updateGuard?.({
      query: {
        destinationId: 'unknown',
        recordDate: '2026-02-30',
      },
    })).toBe('/count/new')
    wrapper.unmount()
  })

  it('不正な修正値では修正欄へフォーカスする', async () => {
    const wrapper = await mountEntryPage(true)
    await wrapper.get('#product-id').setValue('loquat')
    await selectFile(
      wrapper,
      new File(['valid-image'], 'loquat.png', { type: 'image/png' }),
    )
    await finishAnalysis(wrapper)
    await wrapper.get('#corrected-count').setValue('-1')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('#corrected-count-error').text()).toContain(
      '0以上の整数',
    )
    expect(document.activeElement).toBe(wrapper.get('#corrected-count').element)
    wrapper.unmount()
  })

  it('v2から移行した卸先名と商品スナップショットを履歴表示する', async () => {
    window.localStorage.setItem(
      'nexttree:produce-counter:demo:v2',
      JSON.stringify([{
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
        storeName: '旧卸先',
        recordDate: '2026-06-30',
        estimatedCount: 6,
        correctedCount: 7,
        finalCount: 7,
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: '2026-07-01T00:00:00.000Z',
      }]),
    )

    const wrapper = await mountEntryPage()
    await flushPromises()
    const recentRecord = wrapper.get('[data-testid="recent-record"]').text()

    expect(recentRecord).toContain('旧卸先')
    expect(recentRecord).toContain('旧商品 / 旧品種')
    expect(recentRecord).toContain('7束')
    wrapper.unmount()
  })

  it('写真の交換時とアンマウント時にObject URLを解放する', async () => {
    const wrapper = await mountEntryPage()
    await wrapper.get('#product-id').setValue('loquat')
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

  it('縦長画像では赤枠の基準面を画像比率に合わせる', async () => {
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
        disabled: false,
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
})
