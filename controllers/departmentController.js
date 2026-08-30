const db = require('../config/db');

const getDepartments = async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM departments ORDER BY name');
        res.json(result.rows);
    } catch (err) { next(err); }
};

const createDepartment = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({ error: 'Department name is required.' });
        }
        const result = await db.query(
            'INSERT INTO departments (name) VALUES ($1) RETURNING *',
            [name.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Department already exists.' });
        }
        next(err);
    }
};

module.exports = { getDepartments, createDepartment };
