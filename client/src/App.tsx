import { useAuth } from './hooks/useAuth'
import { AuthContextProvider } from './context/AuthContextProvider'
import { Route, Routes, Navigate, BrowserRouter } from 'react-router'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import AIAssistantPage from './pages/AIAssistantPage'
import SavingsGoalsPage from './pages/SavingsGoalsPage'
import { ThemeProvider } from './context/ThemeContextProvider'

// Componente para rutas protegidas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <h1 className='text-xl'>Loading...</h1>
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to='/login' replace />
}

// Componente para rutas públicas (login/register)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-xl'>Loading...</div>
      </div>
    )
  }

  return !user ? <>{children}</> : <Navigate to='/dashboard' replace />
}

const AppRoutes = () => {
  return (
    <Routes>
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
        path='/'
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route
          index
          element={<Navigate to='/dashboard' />}
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
      <ThemeProvider>
        <AuthContextProvider>
          <AppRoutes />
        </AuthContextProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
