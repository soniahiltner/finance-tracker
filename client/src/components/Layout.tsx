import { Outlet, Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { LayoutDashboard, Receipt, Bot, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Layout = () => {

  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transacciones', href: '/transactions', icon: Receipt },
    { name: 'Asistente IA', href: '/ai-assistant', icon: Bot }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 '>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo */}
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-primary-600'>
                FinanceTracker
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className='hidden md:flex space-x-4'>
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className='w-4 h-4 mr-2' />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className='hidden md:flex items-center space-x-4'>
              <span className='text-sm text-gray-600'>
                Hola, <span className='font-medium'>{user?.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className='flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors'
              >
                <LogOut className='w-4 h-4 mr-2' />
                Salir
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100'
            >
              {mobileMenuOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className='md:hidden border-t border-gray-200'>
            <div className='px-2 pt-2 pb-3 space-y-1'>
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-base font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className='w-5 h-5 mr-3' />
                    {item.name}
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className='w-full flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-red-600'
              >
                <LogOut className='w-5 h-5 mr-3' />
                Salir
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
