import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
export const errorRate = new Rate('errors');

// Configuración de la prueba de carga - Ramp/Load
export const options = {
  stages: __ENV.CI_MODE ? [
    // Versión CI - Solo 3 minutos
    { duration: '30s', target: 10 },  // Ramp up rápido
    { duration: '1m', target: 50 },   // Carga moderada
    { duration: '1m', target: 100 },  // Pico
    { duration: '30s', target: 0 },   // Ramp down
  ] : [
    // Versión completa - 10 minutos
    { duration: '1m', target: 10 },   // Ramp up gradual
    { duration: '5m', target: 50 },   // Incremento a 50 usuarios
    { duration: '3m', target: 100 },  // Incremento a 100 usuarios
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: __ENV.CI_MODE ? {
    // Thresholds más permisivos para CI
    'http_req_duration{expected_response:true}': ['p(95)<1000'], // 95% bajo 1000ms
    http_req_failed: ['rate<0.15'],    // Menos del 15% de fallos (más permisivo)
    checks: ['rate>0.80'],             // Más del 80% de checks exitosos (más permisivo)
  } : {
    // Thresholds estrictos para versión completa
    'http_req_duration{expected_response:true}': ['p(95)<500'], // 95% bajo 500ms
    http_req_failed: ['rate<0.01'],    // Menos del 1% de fallos
    checks: ['rate>0.99'],             // Más del 99% de checks exitosos
  },
};

const BASE_URL = 'http://localhost:3000/api';

// Pool de usuarios virtuales (100 usuarios como solicitado)
const VIRTUAL_USERS = [];
for (let i = 1; i <= 100; i++) {
  VIRTUAL_USERS.push({
    username: `testuser${i}`,
    email: `testuser${i}@test.com`,
    password: 'test123'
  });
}

// Credenciales del admin
const ADMIN_CREDENTIALS = {
  username: 'Admin',
  password: '123456'
};

// Variables globales para tokens
let userTokens = {};
let adminToken = '';
let productIds = [];

export function setup() {
  console.log('Iniciando configuración de pruebas...');
  
  // Registrar usuarios de prueba
  console.log('Registrando usuarios de prueba...');
  for (let i = 0; i < Math.min(10, VIRTUAL_USERS.length); i++) {
    const user = VIRTUAL_USERS[i];
    const registerResponse = http.post(`${BASE_URL}/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (registerResponse.status === 201 || registerResponse.status === 400) {
      // Login del usuario registrado
      const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        username: user.username,
        password: user.password
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (loginResponse.status === 200) {
        const loginData = JSON.parse(loginResponse.body);
        userTokens[user.username] = loginData.token;
      }
    }
  }
  
  // Login del admin
  console.log('Iniciando sesión como administrador...');
  const adminLoginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify(ADMIN_CREDENTIALS), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (adminLoginResponse.status === 200) {
    const adminData = JSON.parse(adminLoginResponse.body);
    adminToken = adminData.token;
    console.log('Admin login exitoso');
  }
  
  // Obtener productos existentes
  const productsResponse = http.get(`${BASE_URL}/products`);
  if (productsResponse.status === 200) {
    const products = JSON.parse(productsResponse.body);
    productIds = products.map(p => p.id);
    console.log(`Productos encontrados: ${productIds.length}`);
  }
  
  return { userTokens, adminToken, productIds };
}

export default function(data) {
  const { userTokens, adminToken, productIds } = data;
  
  // Seleccionar usuario aleatorio
  const randomUser = VIRTUAL_USERS[Math.floor(Math.random() * Math.min(10, VIRTUAL_USERS.length))];
  const userToken = userTokens[randomUser.username];
  
  // Peso de las operaciones (probabilidades)
  const action = Math.random();
  
  if (action < 0.3) {
    // 30% - Navegar productos
    testGetProducts();
    
  } else if (action < 0.5 && productIds.length > 0) {
    // 20% - Ver detalle de producto
    testGetProductById(productIds);
    
  } else if (action < 0.7 && userToken) {
    // 20% - Operaciones de carrito
    testCartOperations(userToken, productIds);
    
  } else if (action < 0.85 && userToken) {
    // 15% - Operaciones de perfil y órdenes
    testUserOperations(userToken);
    
  } else if (action < 0.95 && adminToken) {
    // 10% - Operaciones de admin
    testAdminOperations(adminToken);
    
  } else {
    // 5% - Autenticación
    testAuthentication();
  }
  
  sleep(1); // Pausa entre peticiones
}

// Test para obtener todos los productos
function testGetProducts() {
  const response = http.get(`${BASE_URL}/products`);
  
  const success = check(response, {
    'Get products status is 200': (r) => r.status === 200,
    'Get products response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  errorRate.add(!success);
}

// Test para obtener producto por ID
function testGetProductById(productIds) {
  if (productIds.length === 0) return;
  
  const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
  const response = http.get(`${BASE_URL}/products/${randomProductId}`);
  
  const success = check(response, {
    'Get product by ID status is 200': (r) => r.status === 200,
    'Get product by ID response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  errorRate.add(!success);
}

// Test de operaciones de carrito
function testCartOperations(token, productIds) {
  if (!token || productIds.length === 0) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Obtener carrito
  let response = http.get(`${BASE_URL}/cart`, { headers });
  let success = check(response, {
    'Get cart status is 200': (r) => r.status === 200,
  });
  
  // Agregar producto al carrito (50% probabilidad)
  if (Math.random() < 0.5) {
    const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
    response = http.post(`${BASE_URL}/cart/add`, JSON.stringify({
      productId: randomProductId,
      quantity: Math.floor(Math.random() * 3) + 1
    }), { headers });
    
    success = check(response, {
      'Add to cart status is 200': (r) => r.status === 200,
    }) && success;
  }
  
  // Obtener conteo del carrito
  response = http.get(`${BASE_URL}/cart/count`, { headers });
  success = check(response, {
    'Get cart count status is 200': (r) => r.status === 200,
  }) && success;
  
  errorRate.add(!success);
}

// Test de operaciones de usuario
function testUserOperations(token) {
  if (!token) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Obtener perfil
  let response = http.get(`${BASE_URL}/auth/profile`, { headers });
  let success = check(response, {
    'Get profile status is 200': (r) => r.status === 200,
  });
  
  // Verificar si es admin
  response = http.get(`${BASE_URL}/auth/check-admin`, { headers });
  success = check(response, {
    'Check admin status is 200': (r) => r.status === 200,
  }) && success;
  
  // Obtener órdenes del usuario
  response = http.get(`${BASE_URL}/orders`, { headers });
  success = check(response, {
    'Get user orders status is 200': (r) => r.status === 200,
  }) && success;
  
  errorRate.add(!success);
}

// Test de operaciones de administrador
function testAdminOperations(adminToken) {
  if (!adminToken) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };
  
  // Solo lectura para admin en pruebas de carga (evitar modificar datos)
  const response = http.get(`${BASE_URL}/products`, { headers });
  const success = check(response, {
    'Admin get products status is 200': (r) => r.status === 200,
  });
  
  errorRate.add(!success);
}

// Test de autenticación
function testAuthentication() {
  const randomUser = VIRTUAL_USERS[Math.floor(Math.random() * Math.min(10, VIRTUAL_USERS.length))];
  
  const response = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    username: randomUser.username,
    password: randomUser.password
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const success = check(response, {
    'Login status is 200': (r) => r.status === 200,
    'Login response time < 300ms': (r) => r.timings.duration < 300,
    'Login returns token': (r) => {
      if (r.status === 200) {
        const body = JSON.parse(r.body);
        return body.token !== undefined;
      }
      return false;
    },
  });
  
  errorRate.add(!success);
}

export function teardown(data) {
  console.log('Limpieza después de las pruebas completada');
}
