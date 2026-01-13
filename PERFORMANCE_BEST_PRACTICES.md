# Guía de Mejores Prácticas de Rendimiento

## 🎯 Reglas a Seguir al Desarrollar

### 1. **Importaciones**

#### ❌ Evitar

```typescript
// Importar toda la librería
import * as Icons from 'lucide-react'

// Importar componentes grandes sin lazy
import HeavyComponent from './HeavyComponent'
```

#### ✅ Preferir

```typescript
// Importaciones específicas
import { User, Settings } from 'lucide-react'

// Lazy loading para componentes grandes
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### 2. **Componentes**

#### ❌ Evitar

```typescript
// Re-renderizados innecesarios
function Component() {
  const config = { theme: 'dark' } // Nueva instancia cada render
  return <Child config={config} />
}
```

#### ✅ Preferir

```typescript
// Memoización
const config = useMemo(() => ({ theme: 'dark' }), [])

// Callbacks memoizados
const handleClick = useCallback(() => {
  // ...
}, [dependencies])
```

### 3. **React Query**

#### ❌ Evitar

```typescript
// Queries sin staleTime (refetch constante)
useQuery({
  queryKey: ['data'],
  queryFn: fetchData
})
```

#### ✅ Preferir

```typescript
// Con staleTime apropiado
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000 // 5 minutos
})
```

### 4. **Listas Grandes**

#### ❌ Evitar

```typescript
// Renderizar todas las filas
{
  items.map((item) => (
    <Row
      key={item.id}
      data={item}
    />
  ))
}
```

#### ✅ Preferir (si >100 items)

```typescript
// Usar virtualización
import { FixedSizeList } from 'react-window'

;<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {({ index, style }) => (
    <Row
      style={style}
      data={items[index]}
    />
  )}
</FixedSizeList>
```

### 5. **Imágenes**

#### ❌ Evitar

```typescript
<img src='large-image.jpg' />
```

#### ✅ Preferir

```typescript
<img
  src='image.webp'
  loading='lazy'
  width='300'
  height='200'
  alt='descripción'
/>
```

### 6. **useEffect**

#### ❌ Evitar

```typescript
// Effect sin dependencias o con todas las dependencias
useEffect(() => {
  fetchData()
}, []) // Missing dependencies

useEffect(() => {
  heavyOperation()
}) // Runs on every render
```

#### ✅ Preferir

```typescript
// Dependencias correctas
useEffect(() => {
  fetchData(id)
}, [id])

// Debouncing para operaciones pesadas
useEffect(() => {
  const timer = setTimeout(() => {
    heavyOperation(value)
  }, 500)
  return () => clearTimeout(timer)
}, [value])
```

---

## 📊 Métricas a Monitorear

### Core Web Vitals

1. **LCP (Largest Contentful Paint)**: < 2.5s

   - Elemento más grande visible
   - Optimizar imágenes y fonts

2. **FID (First Input Delay)**: < 100ms

   - Respuesta a primera interacción
   - Reducir JavaScript blocking

3. **CLS (Cumulative Layout Shift)**: < 0.1
   - Estabilidad visual
   - Especificar dimensiones de imágenes

### Herramientas

- **Lighthouse**: Chrome DevTools
- **Web Vitals Extension**: Chrome Extension
- **React DevTools Profiler**: Analizar re-renders
- **React Query DevTools**: Monitorear caché

---

## 🔍 Debugging de Rendimiento

### 1. React DevTools Profiler

```typescript
// Envolver componente sospechoso
<Profiler
  id='MyComponent'
  onRender={callback}
>
  <MyComponent />
</Profiler>
```

### 2. Performance Tab (Chrome)

1. Abrir DevTools > Performance
2. Click Record
3. Interactuar con la app
4. Stop y analizar flame chart

### 3. Console Timing

```typescript
console.time('operation')
heavyFunction()
console.timeEnd('operation')
```

---

## 🚀 Checklist Pre-Deploy

- [ ] `npm run build` sin warnings
- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse score > 90
- [ ] No console.logs en producción
- [ ] Imágenes optimizadas
- [ ] Lazy loading implementado
- [ ] React Query configurado
- [ ] Error boundaries en lugares críticos

---

## 🛡️ Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    logErrorToService(error, info)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}

// Uso
;<ErrorBoundary>
  <SuspiciousComponent />
</ErrorBoundary>
```

---

## 💡 Tips Rápidos

1. **Usar memo** para componentes que reciben props que cambian poco
2. **Evitar inline functions** en props si el componente hijo es pesado
3. **Lazy load** todo lo que está fuera de la vista inicial
4. **Code split** por ruta, no por componente individual pequeño
5. **Debounce** inputs de búsqueda (300-500ms)
6. **Virtualizar** listas de más de 100 items
7. **Preload** recursos críticos en `<head>`
8. **Defer** scripts no críticos

---

## 📚 Recursos

- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [TanStack Query Performance](https://tanstack.com/query/latest/docs/framework/react/guides/performance)
- [Vite Performance](https://vitejs.dev/guide/performance)
