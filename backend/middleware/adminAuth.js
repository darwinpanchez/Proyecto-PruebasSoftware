const jwt = require('jsonwebtoken');
const User = require('../model/User');

const adminMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    if (user.username !== 'Admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden realizar esta acción' });
    }
    
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = adminMiddleware;
