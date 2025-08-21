# Pruebas de Rendimiento con k6 - Tienda Tennis

Este directorio contiene scripts de prueba de rendimiento y carga usando k6 para el backend de la tienda de tennis.

## Requisitos Previos

1. **Backend funcionando**: El servidor debe estar corriendo en `http://localhost:3000`
2. **Base de datos configurada**: Con las tablas necesarias creadas
3. **Usuario Admin creado**: Username: `Admin`, Password: `123456`
4. **k6 instalado**: Para ejecutar las pruebas de performance

## 🚀 Proceso de 2 Pasos - Generación de Reportes

### **PASO 1: Generar JSON con k6**
Ejecuta k6 directamente para generar archivos JSON con métricas completas:

#### Load Test (Carga Gradual)
```bash
k6 run --out json=reports/load-final.json load-test.js
```

#### Spike Test (Picos Súbitos)  
```bash
k6 run --out json=reports/spike-final.json spike-test.js
```

#### Soak Test (Resistencia)
```bash
k6 run --out json=reports/soak-final.json soak-test.js
```

### **PASO 2: Convertir JSON a HTML**
Usa el script PowerShell para generar reportes HTML con datos reales:

#### Para un archivo específico:
```powershell
.\step2-html.ps1 -JsonFile "reports\load-final.json"
.\step2-html.ps1 -JsonFile "reports\spike-final.json"  
.\step2-html.ps1 -JsonFile "reports\soak-final.json"
```

#### Para procesar todos los JSON:
```powershell
.\step2-html.ps1 -ProcessAll
```

## 📊 Resultados Generados

### Archivos JSON (Paso 1)
- `reports/load-final.json` - Datos completos del Load Test
- `reports/spike-final.json` - Datos completos del Spike Test  
- `reports/soak-final.json` - Datos completos del Soak Test

### Reportes HTML (Paso 2)
- `reports/load-final-report.html` - Reporte visual del Load Test
- `reports/spike-final-report.html` - Reporte visual del Spike Test
- `reports/soak-final-report.html` - Reporte visual del Soak Test

### Datos Extraídos en HTML
- ✅ **Checks Rate**: % de validaciones exitosas
- ✅ **P95 Duration**: Tiempo de respuesta percentil 95
- ✅ **Failed Rate**: % de requests fallidos  
- ✅ **VUs Max**: Usuarios virtuales máximos
- ✅ **Iterations**: Total de iteraciones completadas
- ✅ **Data Received**: Datos transferidos
- ✅ **RPS**: Requests por segundo

## Scripts de k6 Disponibles (3 Escenarios Empresariales)

### 1. Load Test (`load-test.js`) - Ramp/Load
**Propósito**: Incremento gradual de carga  
- **Patrón**: 10 → 100 VUs en 10 minutos
- **Duración**: ~12 minutos total
- **Uso**: Evaluar rendimiento con incremento gradual de usuarios

### 2. Spike Test (`spike-test.js`) - Picos Súbitos  
**Propósito**: Salto brusco de carga
- **Patrón**: 0 → 300 VUs en 20 segundos, mantener 2 minutos
- **Duración**: ~4 minutos total  
- **Uso**: Evaluar comportamiento ante picos súbitos de tráfico

### 3. Soak Test (`soak-test.js`) - Endurance
**Propósito**: Carga sostenida de larga duración
- **Patrón**: 40 VUs constantes durante 60 minutos
- **Duración**: ~70 minutos total
- **Uso**: Detectar degradación de rendimiento y memory leaks

## Thresholds Empresariales Obligatorios

Todos los scripts implementan thresholds estrictos que harán fallar la prueba si no se cumplen:

- **`checks: rate > 99%`** - Más del 99% de verificaciones exitosas
- **`http_req_duration: p(95) < 500ms`** - 95% de respuestas bajo 500ms  
- **`http_req_failed: rate < 1%`** - Menos del 1% de fallos HTTP

### Evaluación en Reportes HTML
Los reportes HTML muestran automáticamente:
- ✅ **PASO** - Si el threshold se cumple (verde)
- ❌ **FALLO** - Si el threshold no se cumple (rojo)

## 🔧 Beneficios del Proceso de 2 Pasos

### ✅ **Ventajas:**
1. **Separación de responsabilidades**: k6 genera datos, PowerShell genera reportes
2. **Sin dependencias complejas**: Solo k6 y PowerShell nativos
3. **Datos reales**: Extrae métricas exactas del JSON de k6
4. **Flexibilidad**: Puedes procesar JSON existentes sin re-ejecutar tests
5. **CI/CD Ready**: JSON para pipelines, HTML para visualización
6. **Sin problemas de codificación**: Maneja caracteres especiales correctamente

### 📁 **Estructura de Archivos:**
```
testk6/
├── load-test.js           # Script de carga gradual
├── spike-test.js          # Script de picos súbitos  
├── soak-test.js           # Script de resistencia
├── step2-html.ps1         # Convertidor JSON → HTML
├── reports/               # Directorio de salida
│   ├── load-final.json    # Datos JSON del load test
│   ├── load-final-report.html   # Reporte HTML del load test
│   ├── spike-final.json   # Datos JSON del spike test
│   ├── spike-final-report.html  # Reporte HTML del spike test
│   ├── soak-final.json    # Datos JSON del soak test
│   └── soak-final-report.html   # Reporte HTML del soak test
└── README.md              # Esta documentación
```

## Funcionalidades Probadas

### Endpoints de Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login de usuarios  
- `GET /api/auth/profile` - Perfil del usuario
- `GET /api/auth/check-admin` - Verificación de admin

### Endpoints de Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (solo admin)
- `PUT /api/products/:id` - Actualizar producto (solo admin)
- `DELETE /api/products/:id` - Eliminar producto (solo admin)

### Endpoints de Carrito
- `GET /api/cart` - Obtener carrito del usuario
- `GET /api/cart/count` - Obtener conteo de items
- `POST /api/cart/add` - Agregar al carrito
- `PUT /api/cart/:id` - Actualizar cantidad
- `DELETE /api/cart/:id` - Eliminar del carrito

### Endpoints de Órdenes
- `POST /api/orders` - Crear orden
- `GET /api/orders` - Obtener órdenes del usuario
- `GET /api/orders/:id` - Obtener orden específica

## Usuarios de Prueba Creados Automáticamente

Los scripts crean automáticamente usuarios virtuales para las pruebas:
- **Load Test**: `testuser1` a `testuser100` (password: `test123`)
- **Spike Test**: `spikeuser1` a `spikeuser200` (password: `spike123`)  
- **Soak Test**: `soakuser1` a `soakuser50` (password: `soak123`)

### Usuario Administrador Requerido
- **Username**: `Admin`
- **Password**: `123456`
- **Permisos**: Operaciones CRUD en productos

## 🎯 Ejemplo Completo de Uso

### Para Spike Test:

# 1. Ejecutar k6 y generar JSON
k6 run --out json=reports/load-final.json load-test.js
k6 run --out json=reports/spike-final.json spike-test.js  
k6 run --out json=reports/soak-final.json soak-test.js

# 2. Generar reporte HTML desde JSON  
.\step2-html.ps1 -JsonFile "reports\spike-final.json"
.\step2-html.ps1 -JsonFile "reports\load-final.json"
.\step2-html.ps1 -JsonFile "reports\soak-final.json"


### Para todos los tests:




---

**✅ VALIDADO**: Este proceso de 2 pasos ha sido probado y extrae datos reales del JSON de k6, generando reportes HTML precisos con métricas exactas y evaluación correcta de thresholds empresariales.

**🎯 USO RECOMENDADO**: Ideal para CI/CD pipelines donde necesitas tanto datos estructurados (JSON) como reportes visuales (HTML) sin dependencias complejas.
