import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

type ThemeToggleProps = {
  onToggle?: () => void
}

const ThemeToggle = ({ onToggle }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme()

  const handleToggle = () => {
    toggleTheme()
    onToggle?.()
  }

  return (
    <button
      onClick={handleToggle}
      className='rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
      aria-label='Toggle theme'
    >
      {theme === 'light' ? (
        <Moon className='w-5 h-5 text-gray-600 dark:text-gray-400' />
      ) : (
        <Sun className='w-5 h-5 text-yellow-500' />
      )}
    </button>
  )
}

export default ThemeToggle
