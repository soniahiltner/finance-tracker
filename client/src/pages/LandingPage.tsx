import { Link } from 'react-router'
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  BarChart3,
  LogIn,
  UserPlus
} from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

const LandingPage = () => {

  const features = [
    {
      icon: Wallet,
      title: 'Gestión de Transacciones',
      description:
        'Registra y organiza tus ingresos y gastos de manera sencilla y eficiente.'
    },
    {
      icon: PiggyBank,
      title: 'Objetivos de Ahorro',
      description:
        'Establece metas financieras y realiza un seguimiento de tu progreso hacia ellas.'
    },
    {
      icon: BarChart3,
      title: 'Dashboards Inteligentes',
      description:
        'Visualiza tus finanzas con gráficos y estadísticas detalladas en tiempo real.'
    },
    {
      icon: TrendingUp,
      title: 'Asistente con IA',
      description:
        'Obtén insights personalizados y recomendaciones para mejorar tu salud financiera.'
    }
  ]

  return (
    <div className='min-h-screen bg-linear-to-br from-primary-50 to-blue-500 dark:from-gray-900 dark:to-gray-800 flex flex-col'>
      {/* Theme Toggle */}
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <main className='flex-1 flex items-center justify-center px-4 py-12'>
        <div className='max-w-6xl w-full'>
          {/* Hero Section */}
          <div className='text-center mb-16'>
            <h1 className='text-5xl md:text-6xl font-bold text-primary-600 dark:text-gray-100 mb-4'>
              FinanceTracker
            </h1>
            <p className='text-xl font-medium md:text-2xl text-gray-700 dark:text-gray-400 mb-8'>
              Toma el control de tus finanzas personales con inteligencia
              artificial
            </p>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Link
                to='/login'
                className='btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg bg-white text-primary-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 rounded-lg font-semibold transition-colors shadow-lg'
              >
                <LogIn className='h-5 w-5' />
                Iniciar Sesión
              </Link>
              <Link
                to='/register'
                className='inline-flex items-center gap-2 px-8 py-3 text-lg bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-lg font-semibold transition-colors shadow-lg'
              >
                <UserPlus className='h-5 w-5' />
                Crear Cuenta
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow'
                >
                  <div className='bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4'>
                    <Icon className='h-6 w-6 text-primary-600 dark:text-primary-400' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border-t border-white/20 dark:border-gray-700/50 py-8'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-6'>
            {/* About */}
            <div>
              <h4 className='text-white dark:text-gray-200 font-semibold mb-3'>
                Finance Tracker
              </h4>
              <p className='text-white/80 dark:text-gray-400 text-sm'>
                Una herramienta moderna para gestionar tus finanzas personales
                con el poder de la inteligencia artificial.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className='text-white dark:text-gray-200 font-semibold mb-3'>
                Enlaces Rápidos
              </h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link
                    to='/login'
                    className='text-white/80 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors'
                  >
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link
                    to='/register'
                    className='text-white/80 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors'
                  >
                    Crear Cuenta
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className='text-white dark:text-gray-200 font-semibold mb-3'>
                Información
              </h4>
              <p className='text-white/80 dark:text-gray-400 text-sm'>
                © {new Date().getFullYear()} Finance Tracker
                <br />
                Todos los derechos reservados
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className='pt-6 border-t border-white/20 dark:border-gray-700/50'>
            <div className='flex flex-col sm:flex-row justify-between items-center gap-4 text-white/70 dark:text-gray-500 text-sm'>
              <p>Gestiona tus finanzas de manera inteligente</p>
              <div className='flex gap-4'>
                <a
                  href='#'
                  className='hover:text-white dark:hover:text-gray-300 transition-colors'
                >
                  Privacidad
                </a>
                <a
                  href='#'
                  className='hover:text-white dark:hover:text-gray-300 transition-colors'
                >
                  Términos
                </a>
                <a
                  href='#'
                  className='hover:text-white dark:hover:text-gray-300 transition-colors'
                >
                  Contacto
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
