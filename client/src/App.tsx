import { lazy, Suspense } from 'react'
import { useAuth } from './hooks/useAuth'
import { AuthContextProvider } from './context/AuthContextProvider'
import { Route, Routes, Navigate, BrowserRouter } from 'react-router'
import { ThemeProvider } from './context/ThemeContextProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './config/queryClient'

// Lazy loading de páginas para code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const Layout = lazy(() => import('./components/Layout'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'))
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'))
const SavingsGoalsPage = lazy(() => import('./pages/SavingsGoalsPage'))

// React Query DevTools solo en desarrollo
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools
      }))
    )
  : () => null

// Componente de loading mejorado
const PageLoader = () => (
  <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
    <div className='text-center'>
      <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]' />
      <p className='mt-4 text-gray-600 dark:text-gray-400'>Cargando...</p>
    </div>
  </div>
)

// Componente para rutas protegidas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  return user ? (
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  ) : (
    <Navigate
      to='/login'
      replace
    />
  )
}

// Componente para rutas públicas (login/register)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  return !user ? (
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  ) : (
    <Navigate
      to='/app/dashboard'
      replace
    />
  )
}

const AppRoutes = () => {
  const { user, loading } = useAuth()

  return (
    <Routes>
      <Route
        path='/'
        element={
          loading ? (
            <PageLoader />
          ) : user ? (
            <Navigate
              to='/dashboard'
              replace
            />
          ) : (
            <Suspense fallback={<PageLoader />}>
              <LandingPage />
            </Suspense>
          )
        }
      />

      <Route
        path='/login'
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path='/register'
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path='/app'
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route
          index
          element={<Navigate to='/app/dashboard' />}
        />
        <Route
          path='dashboard'
          element={<DashboardPage />}
        />
        <Route
          path='transactions'
          element={<TransactionsPage />}
        />
        <Route
          path='ai-assistant'
          element={<AIAssistantPage />}
        />
        <Route
          path='savings-goals'
          element={<SavingsGoalsPage />}
        />
      </Route>

      {/* Redirect old routes for backwards compatibility */}
      <Route
        path='/dashboard'
        element={
          <Navigate
            to='/app/dashboard'
            replace
          />
        }
      />
      <Route
        path='/transactions'
        element={
          <Navigate
            to='/app/transactions'
            replace
          />
        }
      />
      <Route
        path='/ai-assistant'
        element={
          <Navigate
            to='/app/ai-assistant'
            replace
          />
        }
      />
      <Route
        path='/savings-goals'
        element={
          <Navigate
            to='/app/savings-goals'
            replace
          />
        }
      />

      <Route
        path='*'
        element={<Navigate to='/' />}
      />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthContextProvider>
            <AppRoutes />
          </AuthContextProvider>
        </ThemeProvider>
        {/* DevTools solo en desarrollo, no afecta bundle de producción */}
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
