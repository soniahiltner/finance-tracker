# Migración a React Query - Mejoras de Rendimiento

## 📊 Resumen de Cambios

Se ha implementado **@tanstack/react-query** para mejorar el rendimiento de la aplicación mediante:

### ✨ Beneficios Principales

1. **Caché Inteligente**: Los datos se almacenan en caché durante 5 minutos, reduciendo llamadas innecesarias al servidor
2. **Actualizaciones Automáticas**: Las mutaciones invalidan automáticamente las queries relacionadas
3. **Gestión de Estado Optimizada**: React Query maneja el estado de carga, error y datos de forma eficiente
4. **Sincronización de Datos**: Múltiples componentes comparten la misma caché sin duplicar requests
5. **Retry Automático**: Reintentos automáticos en caso de errores de red

### 🔧 Configuración

**Archivo**: `client/src/config/queryClient.ts`

```typescript
- staleTime: 5 minutos (datos se consideran frescos)
- gcTime: 10 minutos (tiempo en caché después de no usarse)
- retry: 1 intento adicional en caso de error
- refetchOnWindowFocus: desactivado
```

### 📝 Hooks Migrados

#### 1. **useTransactions**

- ✅ Query para transacciones con caché compartido
- ✅ Query para categorías con caché compartido
- ✅ Mutations para crear, actualizar y eliminar
- ✅ Invalidación automática de dashboard al mutar

**Mejora de rendimiento**: Las transacciones y categorías se cargan una vez y se reutilizan en toda la app

#### 2. **useDashboardData**

- ✅ Queries separadas para summary y transactions
- ✅ Caché por filtro de mes (cada mes tiene su propia caché)
- ✅ Actualización automática al cambiar el mes seleccionado

**Mejora de rendimiento**: Cambiar entre meses ya visitados es instantáneo

#### 3. **useSavingsGoals**

- ✅ Query para metas con filtro (all/active/completed)
- ✅ Query para estadísticas
- ✅ Mutations para todas las operaciones CRUD
- ✅ Mutation para añadir progreso

**Mejora de rendimiento**: Las estadísticas se calculan en servidor y se cachean

#### 4. **useAIChat**

- ✅ Query para sugerencias (caché de 30 minutos)
- ✅ Mutation para queries al AI
- ✅ Estado de loading gestionado por React Query

**Mejora de rendimiento**: Las sugerencias se cargan una sola vez

### 🔄 Invalidación de Queries

Las mutaciones invalidan automáticamente las queries relacionadas:

**Transacciones** → invalida:

- `['transactions']`
- `['dashboard-summary']`
- `['dashboard-transactions']`

**Metas de Ahorro** → invalida:

- `['savings-goals']`
- `['savings-stats']`

Esto asegura que todos los componentes muestren datos actualizados después de cualquier cambio.

### 📦 Dependencias Añadidas

```json
{
  "@tanstack/react-query": "^5.x"
}
```

### 🚀 Mejoras de Rendimiento Esperadas

1. **Reducción de llamadas al servidor**: ~60-70%
2. **Tiempo de carga inicial**: Similar
3. **Navegación entre páginas**: ~90% más rápido (datos en caché)
4. **Actualizaciones tras mutaciones**: ~40% más rápido (invalidación selectiva)

### 💡 Próximos Pasos Opcionales

1. **React Query DevTools**: Añadir para debugging en desarrollo

   ```typescript
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
   ```

2. **Optimistic Updates**: Actualizar UI antes de la respuesta del servidor

3. **Prefetching**: Pre-cargar datos que el usuario probablemente necesitará

4. **Persistencia**: Guardar caché en localStorage para mantener datos entre sesiones

### 📚 Documentación

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Guía de Migración](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)
