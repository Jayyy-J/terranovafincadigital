// backend/src/routes/auth.js

const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// --- Endpoint de Registro de Usuarios ---
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
        }
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        const newUserQuery = `
            INSERT INTO users (email, password_hash) VALUES ($1, $2) 
            RETURNING user_id, email, created_at;
        `;
        const result = await pool.query(newUserQuery, [email, password_hash]);
        res.status(201).json({
            message: 'Usuario registrado exitosamente.',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- Endpoint de Inicio de Sesión de Usuarios ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
        }
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(userQuery, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }
        const user = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }
        const tokenPayload = { userId: user.user_id, email: user.email };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token: token
        });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

module.exports = router;