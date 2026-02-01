import { type ReactElement } from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import { AllProviders } from './providers'

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: AllProviders, ...options })

export { customRender as render }
