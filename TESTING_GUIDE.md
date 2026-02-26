# 🧪 Guía de Testing de Optimizaciones

## Paso 1: Build de Producción

```bash
cd client
npm run build
```

### ✅ Qué verificar en el output:

```
dist/assets/react-vendor-[hash].js      ~145 kB  # React, React DOM, Router
dist/assets/query-vendor-[hash].js       ~45 kB  # React Query
dist/assets/chart-vendor-[hash].js       ~95 kB  # Recharts
dist/assets/index-[hash].js              ~25 kB  # Código principal
dist/assets/DashboardPage-[hash].js      ~15 kB  # Lazy chunk
dist/assets/TransactionsPage-[hash].js   ~20 kB  # Lazy chunk
...
```

**Esperado**: Múltiples chunks, ninguno > 500 KB

---

## Paso 2: Preview Local

```bash
npm run preview
```

Abrir navegador en: `http://localhost:4173`

### ✅ Qué verificar:

1. **Network Tab (Chrome DevTools)**:
   - Filtrar por JS
   - Ver que se cargan múltiples chunks pequeños
   - Solo cargan chunks adicionales al navegar

2. **Primera carga** (Login):

   ```
   ✓ react-vendor.js
   ✓ index.js
   ✓ LoginPage.js (lazy)
   ```

3. **Al ir a Dashboard**:
   ```
   ✓ DashboardPage.js (lazy, solo ahora)
   ✓ query-vendor.js
   ✓ chart-vendor.js
   ```

---

## Paso 3: Lighthouse Audit

### En Chrome DevTools:

1. Abrir DevTools (`F12`)
2. Tab "Lighthouse"
3. Configuración:
   - Mode: **Navigation (Default)**
   - Device: **Desktop** o **Mobile**
   - Categories: **Performance** (mínimo)
4. Click **"Analyze page load"**

### ✅ Métricas Esperadas:

| Métrica               | Target  | Descripción              |
| --------------------- | ------- | ------------------------ |
| **Performance Score** | **90+** | Score general            |
| **FCP**               | < 1.8s  | First Contentful Paint   |
| **LCP**               | < 2.5s  | Largest Contentful Paint |
| **TBT**               | < 200ms | Total Blocking Time      |
| **CLS**               | < 0.1   | Cumulative Layout Shift  |
| **Speed Index**       | < 3.4s  | Velocidad visual         |

### ✅ Audits Específicos:

- **"Avoid chaining critical requests"**: ✅ **Passed**
- **"Reduce JavaScript execution time"**: Mejorado
- **"Minimize main thread work"**: Mejorado
- **"Reduce unused JavaScript"**: Mejorado
- **"Keep request counts low"**: Mejorado

---

## Paso 4: Testing Manual de UX

### Escenarios a Probar:

#### 1. **Primera Carga** (Hard Reload)

```
Ctrl + Shift + R (Windows) o Cmd + Shift + R (Mac)
```

**Verificar**:

- ✅ Spinner de carga visible inmediatamente
- ✅ Transición suave a contenido
- ✅ Sin "saltos" visuales (CLS bajo)

#### 2. **Navegación entre Páginas**

**Login → Dashboard → Transactions → AI Assistant → Savings Goals**

**Verificar**:

- ✅ Spinner breve al cambiar página (primera vez)
- ✅ Instantáneo en segunda visita (caché)
- ✅ Sin errores en consola

#### 3. **Modo Oscuro/Claro**

**Verificar**:

- ✅ Transición suave sin re-cargas
- ✅ Spinner mantiene tema correcto

---

## Paso 5: Network Analysis

### Con Network Tab Abierto:

1. **Disable cache**: ✅ Check "Disable cache"
2. **Throttling**: Fast 3G o Slow 3G
3. **Hard reload**: `Ctrl + Shift + R`

### ✅ Qué verificar:

**Waterfall Chart**:

```
HTML (index.html)
  ├─ CSS (index.css)
  ├─ JS (react-vendor.js)    ← Parallel
  ├─ JS (index.js)            ← Parallel
  └─ JS (LoginPage.js)        ← Lazy loaded
```

**NO debe haber cadenas largas** como:

```
❌ index.html → vendor.js → lib1.js → lib2.js → lib3.js
```

**SÍ debe haber carga paralela**:

```
✅ index.html
    ├─ vendor1.js  ║
    ├─ vendor2.js  ║ Paralelo
    ├─ vendor3.js  ║
```

---

## Paso 6: Bundle Size Analysis

### Instalar analyzer (opcional):

```bash
npm install -D rollup-plugin-visualizer
```

### Agregar a `vite.config.ts`:

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ open: true }) // Solo para análisis
  ]
})
```

### Ejecutar:

```bash
npm run build
```

Abrirá automáticamente un gráfico interactivo mostrando:

- Tamaño de cada chunk
- Qué librerías ocupan más espacio
- Oportunidades de optimización

---

## Paso 7: Comparación Antes/Después

### Capturar métricas ANTES de optimizaciones:

```bash
# Checkout a commit anterior
git checkout <commit-antes-optimizaciones>

# Build
npm run build

# Lighthouse audit y guardar reporte
```

### Capturar métricas DESPUÉS:

```bash
# Volver a main
git checkout main

# Build
npm run build

# Lighthouse audit y comparar
```

### Crear tabla comparativa:

| Métrica     | Antes | Después | Mejora |
| ----------- | ----- | ------- | ------ |
| Performance | 68    | **92**  | +35%   |
| Bundle (KB) | 620   | **180** | -71%   |
| FCP (s)     | 2.4   | **1.1** | -54%   |
| LCP (s)     | 3.6   | **1.6** | -56%   |
| TTI (s)     | 4.2   | **1.9** | -55%   |

---

## Paso 8: Testing en Diferentes Condiciones

### A. **Slow 3G** (Network throttling)

```
Network tab → Throttling: Slow 3G
```

**Verificar**: App sigue siendo usable, chunks cargan progresivamente

### B. **CPU throttling**

```
Performance tab → CPU: 4x slowdown
```

**Verificar**: No se congela, interacciones responden

### C. **Mobile viewport**

```
Toggle device toolbar → iPhone 12 Pro
```

---

## Smoke E2E rápido (UI + Accesibilidad)

Para validar rápidamente comportamiento clave de modales y menú móvil:

```bash
cd client
npm run test:e2e:smoke:ui
```

Incluye:

- Cierre automático del menú móvil al cambiar tema/idioma/moneda.
- Accesibilidad de modales de transacciones (focus trap, ESC, backdrop, restore focus).
- Accesibilidad de modales de metas (ESC y restore focus).

**Verificar**: Layout responsive, chunks optimizados para móvil

---

## ✅ Checklist Final

- [ ] `npm run build` sin errores
- [ ] Múltiples chunks generados (6-8)
- [ ] Ningún chunk > 500 KB
- [ ] Total gzipped < 300 KB
- [ ] Lighthouse Performance > 90
- [ ] "Avoid chaining critical requests" = Passed ✅
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] No errores en consola
- [ ] Navegación fluida entre páginas
- [ ] Lazy chunks cargan correctamente
- [ ] DevTools NO en bundle de producción

---

## 🐛 Troubleshooting

### Problema: Chunks no se cargan

**Solución**:

```typescript
// Verificar que imports sean dinámicos
const Page = lazy(() => import('./Page')) // ✅
import Page from './Page' // ❌
```

### Problema: Bundle sigue siendo grande

**Solución**:

```bash
# Analizar con visualizer
npm install -D rollup-plugin-visualizer
npm run build
```

Identificar librerías pesadas y:

1. Lazy load si no son críticas
2. Buscar alternativas más ligeras
3. Importar solo lo necesario

### Problema: DevTools en producción

**Verificar**:

```typescript
import.meta.env.DEV // Solo debe ser true en desarrollo
```

---

## 📊 Comandos Útiles

```bash
# Build normal
npm run build

# Build con análisis
npm run build:analyze

# Preview
npm run preview

# Dev con DevTools
npm run dev

# Ver tamaño de archivos
ls -lh dist/assets/

# Gzip simulation
gzip -c dist/assets/index-*.js | wc -c
```

---

## 📝 Documentar Resultados

Crear issue o PR con:

1. **Screenshots de Lighthouse** (antes/después)
2. **Tabla de comparación** de métricas
3. **Lista de chunks** generados
4. **Tamaño total** del bundle
5. **Observaciones** de UX

---

**Última actualización**: 13 de enero de 2026
