// backend/src/routes/farms.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); // Importaremos la conexión a la BD desde un archivo separado
const authenticateToken = require('../middleware/auth');

// --- Ruta para OBTENER todas las fincas de un usuario ---
// Esta ruta está protegida. Solo se puede acceder con un token válido.
router.get('/', authenticateToken, async (req, res) => {
    try {
        // El 'guardaespaldas' (authenticateToken) nos dio los datos del usuario en req.user
        const userId = req.user.userId;
        const result = await pool.query('SELECT * FROM farms WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener fincas:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- Ruta para CREAR una nueva finca ---
// También protegida.
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { farm_name } = req.body;
        const userId = req.user.userId;

        if (!farm_name) {
            return res.status(400).json({ message: 'El nombre de la finca es requerido.' });
        }

        const newFarmQuery = 'INSERT INTO farms (user_id, farm_name) VALUES ($1, $2) RETURNING *';
        const result = await pool.query(newFarmQuery, [userId, farm_name]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear la finca:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;