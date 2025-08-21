import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
export const errorRate = new Rate('errors');

// Configuración para Spike Testing (picos súbitos de carga)
export const options = {
  stages: __ENV.CI_MODE ? [
    // Versión CI - Solo 3 minutos
    { duration: '30s', target: 0 },   // Línea base
    { duration: '15s', target: 50 },  // SPIKE reducido (0 → 50 VUs)
    { duration: '1m30s', target: 50 }, // Mantener el spike por 1.5 min
    { duration: '15s', target: 0 },   // Caída súbita
    { duration: '30s', target: 0 },   // Recuperación
  ] : [
    // Versión completa - 6 minutos
    { duration: '30s', target: 0 },   // Línea base
    { duration: '20s', target: 300 }, // SPIKE súbito (0 → 300 VUs en 20s)
    { duration: '2m', target: 300 },  // Mantener el spike por 2 minutos
    { duration: '20s', target: 0 },   // Caída súbita
    { duration: '30s', target: 0 },   // Recuperación
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

const BASE_URL = 'http://localhost:4000/api';

// Pool amplio de usuarios para spike testing
const SPIKE_USERS = [];
for (let i = 1; i <= 200; i++) {
  SPIKE_USERS.push({
    username: `spikeuser${i}`,
    email: `spikeuser${i}@test.com`,
    password: 'spike123'
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
  console.log('Iniciando configuración para Spike Testing...');
  console.log('ADVERTENCIA: Prueba de picos súbitos de carga');
  
  // Registrar usuarios para spike testing (más cantidad)
  for (let i = 0; i < Math.min(50, SPIKE_USERS.length); i++) {
    const user = SPIKE_USERS[i];
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
  
  // Durante spikes, comportamiento más agresivo
  const randomUser = SPIKE_USERS[Math.floor(Math.random() * Math.min(50, SPIKE_USERS.length))];
  const userToken = userTokens[randomUser.username];
  
  // Comportamiento intensivo durante spike
  const action = Math.random();
  
  if (action < 0.4) {
    // 40% - Carga intensiva de productos
    intensiveProductBrowsing(productIds);
    
  } else if (action < 0.7 && userToken) {
    // 30% - Operaciones intensivas de carrito
    intensiveCartOperations(userToken, productIds);
    
  } else if (action < 0.85 && userToken) {
    // 15% - Múltiples operaciones de usuario
    intensiveUserOperations(userToken);
    
  } else if (action < 0.95) {
    // 10% - Múltiples logins
    intensiveAuthentication();
    
  } else if (adminToken) {
    // 5% - Operaciones de admin
    testAdminOperations(adminToken);
  }
  
  // Pausa mínima durante spikes
  sleep(Math.random() * 0.5 + 0.1); // 0.1-0.6 segundos
}

function intensiveProductBrowsing(productIds) {
  // Múltiples peticiones rápidas
  for (let i = 0; i < 3; i++) {
    testGetProducts();
    
    if (productIds.length > 0 && Math.random() < 0.7) {
      testGetProductById(productIds);
    }
    
    sleep(0.1); // Pausa muy corta
  }
}

function intensiveCartOperations(token, productIds) {
  if (!token || productIds.length === 0) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Múltiples operaciones de carrito
  for (let i = 0; i < 2; i++) {
    // Obtener carrito
    let response = http.get(`${BASE_URL}/cart`, { headers });
    let success = check(response, {
      'Spike - Get cart status is 200': (r) => r.status === 200,
    });
    
    // Agregar productos rápidamente
    const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
    response = http.post(`${BASE_URL}/cart/add`, JSON.stringify({
      productId: randomProductId,
      quantity: 1
    }), { headers });
    
    success = check(response, {
      'Spike - Add to cart status is 200': (r) => r.status === 200,
    }) && success;
    
    // Obtener conteo
    response = http.get(`${BASE_URL}/cart/count`, { headers });
    success = check(response, {
      'Spike - Get cart count status is 200': (r) => r.status === 200,
    }) && success;
    
    errorRate.add(!success);
    sleep(0.1);
  }
}

function intensiveUserOperations(token) {
  if (!token) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Múltiples peticiones de perfil y órdenes
  let response = http.get(`${BASE_URL}/auth/profile`, { headers });
  let success = check(response, {
    'Spike - Get profile status is 200': (r) => r.status === 200,
  });
  
  response = http.get(`${BASE_URL}/auth/check-admin`, { headers });
  success = check(response, {
    'Spike - Check admin status is 200': (r) => r.status === 200,
  }) && success;
  
  response = http.get(`${BASE_URL}/orders`, { headers });
  success = check(response, {
    'Spike - Get user orders status is 200': (r) => r.status === 200,
  }) && success;
  
  errorRate.add(!success);
}

function intensiveAuthentication() {
  // Múltiples logins rápidos
  for (let i = 0; i < 2; i++) {
    const randomUser = SPIKE_USERS[Math.floor(Math.random() * Math.min(50, SPIKE_USERS.length))];
    
    const response = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      username: randomUser.username,
      password: randomUser.password
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const success = check(response, {
      'Spike - Login status is 200': (r) => r.status === 200,
      'Spike - Login returns token': (r) => {
        if (r.status === 200) {
          const body = JSON.parse(r.body);
          return body.token !== undefined;
        }
        return false;
      },
    });
    
    errorRate.add(!success);
    sleep(0.1);
  }
}

function testGetProducts() {
  const response = http.get(`${BASE_URL}/products`);
  
  const success = check(response, {
    'Spike - Get products status is 200': (r) => r.status === 200,
    'Spike - Get products response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!success);
}

function testGetProductById(productIds) {
  if (productIds.length === 0) return;
  
  const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
  const response = http.get(`${BASE_URL}/products/${randomProductId}`);
  
  const success = check(response, {
    'Spike - Get product by ID status is 200': (r) => r.status === 200,
    'Spike - Get product by ID response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
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
    'Spike - Admin get products status is 200': (r) => r.status === 200,
  });
  
  errorRate.add(!success);
}

export function teardown(data) {
  console.log('Spike Testing completado');
  console.log('Revisar métricas para evaluar resistencia a picos de carga');
  console.log('Verificar si el sistema se recuperó correctamente después de los spikes');
}
