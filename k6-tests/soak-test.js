import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
export const errorRate = new Rate('errors');

// Configuración para Soak Testing (prueba de endurance/resistencia)
export const options = {
  stages: __ENV.CI_MODE ? [
    // Versión CI - Solo 5 minutos
    { duration: '1m', target: 20 },  // Ramp up rápido
    { duration: '3m', target: 20 },  // Mantener carga reducida 3min
    { duration: '1m', target: 0 },   // Ramp down
  ] : [
    // Versión completa - 3 minutos
    { duration: '30s', target: 40 },  // Ramp up a carga sostenida
    { duration: '2m', target: 40 },   // Mantener 40 VUs durante 2 minutos
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration{expected_response:true}': ['p(95)<500'], // 95% bajo 500ms
    http_req_failed: ['rate<0.01'],    // Menos del 1% de fallos
    checks: ['rate>0.99'],             // Más del 99% de checks exitosos
  },
};

const BASE_URL = 'http://localhost:4000/api';

// Pool de usuarios para soak testing
const SOAK_USERS = [];
for (let i = 1; i <= 50; i++) {
  SOAK_USERS.push({
    username: `soakuser${i}`,
    email: `soakuser${i}@test.com`,
    password: 'soak123'
  });
}

const ADMIN_CREDENTIALS = {
  username: 'Admin',
  password: '123456'
};

let userTokens = {};
let adminToken = '';
let productIds = [];

export function setup() {
  console.log('Iniciando configuración para Soak Testing...');
  console.log('Duración total: ~1.5 horas');
  
  // Registrar usuarios de soak testing
  for (let i = 0; i < Math.min(20, SOAK_USERS.length); i++) {
    const user = SOAK_USERS[i];
    const registerResponse = http.post(`${BASE_URL}/auth/register`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (registerResponse.status === 201 || registerResponse.status === 400) {
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
  const adminLoginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify(ADMIN_CREDENTIALS), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (adminLoginResponse.status === 200) {
    const adminData = JSON.parse(adminLoginResponse.body);
    adminToken = adminData.token;
  }
  
  // Obtener productos
  const productsResponse = http.get(`${BASE_URL}/products`);
  if (productsResponse.status === 200) {
    const products = JSON.parse(productsResponse.body);
    productIds = products.map(p => p.id);
  }
  
  return { userTokens, adminToken, productIds };
}

export default function(data) {
  const { userTokens, adminToken, productIds } = data;
  
  // Comportamiento más realista para soak testing
  const randomUser = SOAK_USERS[Math.floor(Math.random() * Math.min(20, SOAK_USERS.length))];
  const userToken = userTokens[randomUser.username];
  
  // Simular sesión completa de usuario
  simulateUserSession(userToken, productIds, adminToken);
  
  // Pausa más larga entre sesiones para soak testing
  sleep(Math.random() * 3 + 2); // 2-5 segundos
}

function simulateUserSession(userToken, productIds, adminToken) {
  // 1. Navegar productos (alta probabilidad)
  if (Math.random() < 0.9) {
    testGetProducts();
    sleep(1);
  }
  
  // 2. Ver algunos productos específicos
  if (Math.random() < 0.7 && productIds.length > 0) {
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      testGetProductById(productIds);
      sleep(0.5);
    }
  }
  
  // 3. Operaciones de carrito si tiene token
  if (userToken && Math.random() < 0.6) {
    testCartOperations(userToken, productIds);
    sleep(1);
  }
  
  // 4. Revisar perfil ocasionalmente
  if (userToken && Math.random() < 0.3) {
    testUserOperations(userToken);
    sleep(1);
  }
  
  // 5. Operaciones de admin muy ocasionalmente
  if (adminToken && Math.random() < 0.05) {
    testAdminOperations(adminToken);
    sleep(1);
  }
}

function testGetProducts() {
  const response = http.get(`${BASE_URL}/products`);
  
  const success = check(response, {
    'Soak - Get products status is 200': (r) => r.status === 200,
    'Soak - Get products response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);
}

function testGetProductById(productIds) {
  if (productIds.length === 0) return;
  
  const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
  const response = http.get(`${BASE_URL}/products/${randomProductId}`);
  
  const success = check(response, {
    'Soak - Get product by ID status is 200': (r) => r.status === 200,
    'Soak - Get product by ID response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(!success);
}

function testCartOperations(token, productIds) {
  if (!token || productIds.length === 0) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Obtener carrito
  let response = http.get(`${BASE_URL}/cart`, { headers });
  let success = check(response, {
    'Soak - Get cart status is 200': (r) => r.status === 200,
  });
  
  // Agregar producto al carrito
  if (Math.random() < 0.4) {
    const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
    response = http.post(`${BASE_URL}/cart/add`, JSON.stringify({
      productId: randomProductId,
      quantity: Math.floor(Math.random() * 2) + 1
    }), { headers });
    
    success = check(response, {
      'Soak - Add to cart status is 200': (r) => r.status === 200,
    }) && success;
  }
  
  // Obtener conteo
  response = http.get(`${BASE_URL}/cart/count`, { headers });
  success = check(response, {
    'Soak - Get cart count status is 200': (r) => r.status === 200,
  }) && success;
  
  errorRate.add(!success);
}

function testUserOperations(token) {
  if (!token) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Obtener perfil
  let response = http.get(`${BASE_URL}/auth/profile`, { headers });
  let success = check(response, {
    'Soak - Get profile status is 200': (r) => r.status === 200,
  });
  
  // Obtener órdenes
  response = http.get(`${BASE_URL}/orders`, { headers });
  success = check(response, {
    'Soak - Get user orders status is 200': (r) => r.status === 200,
  }) && success;
  
  errorRate.add(!success);
}

function testAdminOperations(adminToken) {
  if (!adminToken) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };
  
  const response = http.get(`${BASE_URL}/products`, { headers });
  const success = check(response, {
    'Soak - Admin get products status is 200': (r) => r.status === 200,
  });
  
  errorRate.add(!success);
}

export function teardown(data) {
  console.log('Soak Testing completado - Limpieza finalizada');
  console.log('Revisar métricas para detectar degradación de rendimiento');
}
