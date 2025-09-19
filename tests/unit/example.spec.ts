import { mount } from '@vue/test-utils'
import Tab1Page from '@/views/MapaPage.vue'
import { describe, expect, test } from 'vitest'

describe('MapaPage.vue', () => {
  test('renders tab 1 Tab1Page', () => {
    const wrapper = mount(Tab1Page)
    expect(wrapper.text()).toMatch('Tab 1 page')
  })
})
