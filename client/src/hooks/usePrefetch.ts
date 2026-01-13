import { useEffect, useState } from 'react'

/**
 * Hook para pre-cargar componentes lazy de forma progresiva
 * Útil para mejorar la navegación entre páginas
 */
export const usePrefetch = () => {
  const [prefetched, setPrefetched] = useState(false)

  useEffect(() => {
    // Esperar a que la página inicial termine de cargar
    if (document.readyState === 'complete' && !prefetched) {
      // Delay para no interferir con el renderizado inicial
      const timer = setTimeout(() => {
        // Prefetch de rutas comunes después de la carga inicial
        Promise.all([
          import('../pages/DashboardPage'),
          import('../pages/TransactionsPage')
        ]).then(() => {
          setPrefetched(true)
        })
      }, 2000) // 2 segundos después de la carga completa

      return () => clearTimeout(timer)
    }
  }, [prefetched])

  return prefetched
}
