// backend/src/server.js

// Carga las variables de entorno desde el archivo .env al inicio de todo
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const path = require('path');

// --- Importamos nuestras nuevas rutas ---
const authRoutes = require('./routes/auth'); // Rutas para /register y /login
const farmRoutes = require('./routes/farms'); // Rutas para /farms

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // Para que el servidor entienda JSON
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // Para servir los archivos del frontend

// ===============================================
// --- Rutas de la API (Endpoints) ---
// ===============================================
// Le decimos a la app que todas las rutas que empiecen con /api
// deben ser manejadas por nuestro archivo de rutas de autenticación.
app.use('/api', authRoutes);

// Le decimos a la app que todas las rutas que empiecen con /api/farms
// deben ser manejadas por nuestro archivo de rutas de fincas.
// Estas rutas estarán protegidas por nuestro middleware de autenticación.
app.use('/api/farms', farmRoutes);


// --- Arranque del Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
