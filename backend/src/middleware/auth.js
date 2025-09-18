// backend/src/middleware/auth.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Este es nuestro "guardaespaldas"
const authenticateToken = (req, res, next) => {
    // Busca el token en la cabecera 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    // Si no hay token, no puede pasar
    if (token == null) {
        return res.sendStatus(401); // 401 Unauthorized
    }

    // Verificamos si el token es válido
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // 403 Forbidden (el token es inválido)
        }
        // Si el token es válido, guardamos los datos del usuario en la petición
        // y le permitimos continuar a la siguiente función.
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;