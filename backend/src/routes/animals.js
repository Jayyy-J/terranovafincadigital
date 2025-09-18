// backend/src/routes/animals.js

const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// --- Ruta para OBTENER todos los animales de UNA finca específica ---
// La ruta será /api/animals/by-farm/:farmId
router.get('/by-farm/:farmId', authenticateToken, async (req, res) => {
    try {
        const { farmId } = req.params; // Obtenemos el ID de la finca desde la URL
        const userId = req.user.userId;

        // Verificamos que la finca pertenece al usuario que hace la petición (por seguridad)
        const farmCheck = await pool.query('SELECT user_id FROM farms WHERE farm_id = $1', [farmId]);
        if (farmCheck.rows.length === 0 || farmCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Acceso no autorizado a esta finca.' });
        }
        
        const result = await pool.query('SELECT * FROM animals WHERE farm_id = $1 ORDER BY animal_code', [farmId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener animales:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- Ruta para CREAR un nuevo animal en UNA finca específica ---
router.post('/', authenticateToken, async (req, res) => {
    try {
        // Los datos del animal y el ID de la finca vendrán en el cuerpo de la petición
        const { farm_id, animal_code, breed, birth_date, weight_kg } = req.body;
        const userId = req.user.userId;

        // Validación de datos
        if (!farm_id || !animal_code) {
            return res.status(400).json({ message: 'El ID de la finca y el código del animal son requeridos.' });
        }

        // Verificación de seguridad (similar a la anterior)
        const farmCheck = await pool.query('SELECT user_id FROM farms WHERE farm_id = $1', [farm_id]);
        if (farmCheck.rows.length === 0 || farmCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Acceso no autorizado para añadir animales a esta finca.' });
        }

        const newAnimalQuery = `
            INSERT INTO animals (farm_id, animal_code, breed, birth_date, weight_kg)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const result = await pool.query(newAnimalQuery, [farm_id, animal_code, breed, birth_date, weight_kg]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear el animal:', error);
        if (error.code === '23505') { // Error de código de animal duplicado
            return res.status(409).json({ message: 'Ya existe un animal con ese código en esta finca.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;