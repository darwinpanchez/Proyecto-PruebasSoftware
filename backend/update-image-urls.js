const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateImageUrls() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tennis_store'
  });

  try {
    // Actualizar URLs que comenzaron con assets/images/ para apuntar al backend
    const updateQuery = `
      UPDATE products 
      SET image = REPLACE(image, 'assets/images/', 'http://localhost:3000/uploads/') 
      WHERE image LIKE 'assets/images/image-%'
    `;
    
    const [result] = await connection.execute(updateQuery);
    console.log(`URLs actualizadas: ${result.affectedRows} productos`);
    
    // Mostrar todos los productos para verificar
    const [products] = await connection.execute('SELECT id, name, image FROM products');
    console.log('\nProductos actuales:');
    products.forEach(product => {
      console.log(`${product.id}: ${product.name} -> ${product.image}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

updateImageUrls();
