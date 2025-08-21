# Tienda Sneakers Online

[![CI/CD Pipeline](https://github.com/JosueAFerrin/tienda_sneakers_online/actions/workflows/ci.yml/badge.svg)](https://github.com/JosueAFerrin/tienda_sneakers_online/actions/workflows/ci.yml)

Una aplicación web completa para la venta de sneakers/zapatillas deportivas con backend Node.js/Express, base de datos MySQL y frontend React, incluyendo un pipeline CI/CD completo con GitHub Actions.

## 🏗️ Arquitectura del Proyecto

```
tienda_tennis/
├── backend/                 # Servidor Express.js
│   ├── config/             # Configuración de base de datos
│   ├── controller/         # Controladores de lógica de negocio
│   ├── middleware/         # Middleware de autenticación
│   ├── model/              # Modelos de datos
│   ├── routes/             # Rutas de la API
│   └── index.js            # Archivo principal del servidor
├── frontend/               # Aplicación Angular
│   └── src/app/
│       ├── components/     # Componentes de la UI
│       ├── models/         # Interfaces TypeScript
│       └── services/       # Servicios para API calls
├── database/               # Scripts SQL
└── README.md
```

## 🚀 Características

- ✅ **Autenticación de usuarios** (registro y login)
- ✅ **Catálogo de productos** con información detallada
- ✅ **Carrito de compras** funcional
- ✅ **Sistema de órdenes** completo
- ✅ **Interfaz responsive** moderna
- ✅ **API RESTful** bien estructurada
- ✅ **Base de datos MySQL** normalizada

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL Server
- Angular CLI (`npm install -g @angular/cli`)

## 🔧 Instalación

### 1. Configurar Base de Datos

1. Crear una base de datos llamada `tennis_store` en MySQL
2. Importar el archivo `database/tennis_store.sql`

```sql
CREATE DATABASE tennis_store;
USE tennis_store;
SOURCE database/tennis_store.sql;
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Editar el archivo `.env` con tus credenciales de MySQL:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=tennis_store
JWT_SECRET=tu_clave_secreta_jwt
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

## 🏃‍♂️ Ejecutar la Aplicación

### Iniciar Backend
```bash
cd backend
npm run dev
# o
npm start
```
El servidor estará disponible en `http://localhost:3000`

### Iniciar Frontend
```bash
cd frontend
ng serve
# o
npm start
```
La aplicación estará disponible en `http://localhost:4200`

## 📊 Estructura de la Base de Datos

### Tablas Principales:
- **users**: Información de usuarios registrados
- **products**: Catálogo de productos de tenis
- **cart**: Items en el carrito de cada usuario
- **orders**: Órdenes de compra realizadas
- **order_items**: Detalles de productos en cada orden

## 🛠️ API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario (requiere auth)

### Productos
- `GET /api/products` - Listar todos los productos
- `GET /api/products/:id` - Obtener producto específico
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Carrito
- `GET /api/cart` - Obtener carrito del usuario
- `POST /api/cart/add` - Agregar producto al carrito
- `PUT /api/cart/:id` - Actualizar cantidad en carrito
- `DELETE /api/cart/:id` - Eliminar item del carrito
- `DELETE /api/cart` - Limpiar carrito completo

### Órdenes
- `POST /api/orders` - Crear nueva orden
- `GET /api/orders` - Obtener órdenes del usuario
- `GET /api/orders/:id` - Obtener orden específica

## 🔒 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación. Los tokens se almacenan en localStorage del frontend y se envían en el header Authorization como Bearer tokens.

## 💡 Características Técnicas

### Backend (Express.js)
- Arquitectura MVC (Model-View-Controller)
- Middleware de autenticación JWT
- Validación de datos
- Manejo de errores centralizado
- Pool de conexiones MySQL

### Frontend (Angular)
- Componentes standalone
- Reactive forms
- HTTP interceptors
- Services para manejo de estado
- Responsive design con CSS Grid/Flexbox

## 🎨 Productos de Muestra

La base de datos incluye 6 productos de tenis:
1. Nike Air Zoom Vapor - $120.00
2. Adidas CourtJam Bounce - $95.50
3. Wilson Rush Pro 3.0 - $110.00
4. Asics Gel-Resolution 8 - $130.00
5. New Balance 996v4 - $105.00
6. Babolat Jet Mach II - $125.00

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Dispositivos móviles
- 📱 Tablets
- 💻 Escritorio

## 🚀 Próximas Características

- [ ] Panel de administración
- [ ] Gestión de inventario
- [ ] Sistema de wishlist
- [ ] Filtros de búsqueda avanzados
- [ ] Sistema de reviews y ratings
- [ ] Integración con pasarelas de pago

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👥 Autores

- **Darwin Panchez** - *Desarrollo inicial* - [darwinpanchez](https://github.com/darwinpanchez)

---

⚡ **¡Desarrollado con pasión para los amantes del tenis!** 🎾
