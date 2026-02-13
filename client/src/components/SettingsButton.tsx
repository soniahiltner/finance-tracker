import { useEffect, useRef, useState } from 'react'
import { Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import LanguageSelector from './LanguageSelector'
import CurrencySelector from './CurrencySelector'
import { useTranslation } from '../hooks/useTranslation'

const SettingsButton = () => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current) {
        return
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      className='relative'
    >
      <button
        className='p-2'
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        title={t.settings}
      >
        <Settings className='w-4 h-4 text-gray-600 dark:text-gray-400' />
      </button>
      {open && (
        <div className='absolute mt-3 p-2  bg-gray-50 border border-gray-400 dark:bg-gray-700 rounded-md shadow-lg z-50 flex flex-col gap-1 animate-move-down'>
          <span className='flex items-center gap-5 py-2 text-sm text-gray-600 dark:text-gray-300'>
            {t.theme} <ThemeToggle onToggle={() => setOpen(false)} />
          </span>
          <LanguageSelector onSelect={() => setOpen(false)} />
          <CurrencySelector onSelect={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}

export default SettingsButton
