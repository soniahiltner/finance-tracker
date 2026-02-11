import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsButton from './SettingsButton'

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: {
      settings: 'Settings',
      theme: 'Theme'
    }
  })
}))

vi.mock('./ThemeToggle', () => ({
  default: ({ onToggle }: { onToggle?: () => void }) => (
    <button onClick={onToggle}>Toggle theme</button>
  )
}))

vi.mock('./LanguageSelector', () => ({
  default: ({ onSelect }: { onSelect?: () => void }) => (
    <button onClick={onSelect}>Language</button>
  )
}))

describe('SettingsButton', () => {
  it('closes when clicking outside', () => {
    render(<SettingsButton />)

    fireEvent.click(screen.getByTitle('Settings'))
    expect(screen.getByText('Theme')).toBeInTheDocument()

    fireEvent.pointerDown(document.body)
    expect(screen.queryByText('Theme')).not.toBeInTheDocument()
  })

  it('closes when toggling theme', () => {
    render(<SettingsButton />)

    fireEvent.click(screen.getByTitle('Settings'))
    fireEvent.click(screen.getByText('Toggle theme'))

    expect(screen.queryByText('Theme')).not.toBeInTheDocument()
  })

  it('closes when selecting language', () => {
    render(<SettingsButton />)

    fireEvent.click(screen.getByTitle('Settings'))
    fireEvent.click(screen.getByText('Language'))

    expect(screen.queryByText('Theme')).not.toBeInTheDocument()
  })
})
