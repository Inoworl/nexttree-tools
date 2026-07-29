import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CountNewPage from '../pages/count/new.vue'

describe('カウント作業開始ページ', () => {
  const navigateTo = vi.fn()
  const useHead = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-30T03:00:00.000Z'))
    navigateTo.mockReset()
    useHead.mockReset()
    vi.stubGlobal('navigateTo', navigateTo)
    vi.stubGlobal('useHead', useHead)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('当日を初期日付にし、卸先未選択では開始できない', async () => {
    const wrapper = mount(CountNewPage, { attachTo: document.body })
    await flushPromises()

    expect(wrapper.get<HTMLInputElement>('#record-date').element.value).toBe(
      '2026-07-30',
    )
    expect(
      wrapper.get<HTMLButtonElement>('[data-testid="start-counting"]').element
        .disabled,
    ).toBe(true)

    await wrapper.get('#destination-id').setValue('central-market')

    expect(
      wrapper.get<HTMLButtonElement>('[data-testid="start-counting"]').element
        .disabled,
    ).toBe(false)
    wrapper.unmount()
  })

  it('卸先IDと記録日だけをクエリにしてカウントページへ進む', async () => {
    const wrapper = mount(CountNewPage)
    await flushPromises()
    await wrapper.get('#destination-id').setValue('harbor-store')
    await wrapper.get('#record-date').setValue('2026-07-29')
    await wrapper.get('form').trigger('submit')

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/count/entry',
      query: {
        destinationId: 'harbor-store',
        recordDate: '2026-07-29',
      },
    })
    wrapper.unmount()
  })
})
