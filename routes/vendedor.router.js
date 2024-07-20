const express = require('express');
const router  = express.Router();
const db  = require('../database.js');


router.post('/', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const { id, nombre, cargo, telefono, salario,id_consecionario } = req.body;

        const query = 'INSERT INTO vendedor (id, nombre, cargo, telefono, salario,id_consecionario) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [id, nombre, cargo, telefono, salario,id_consecionario];
        
        const result = await client.query(query, values);
        
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Vendedor agregado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al agregar el vendedor', details: err.message });
    } finally {
        client.release();
    }
});

router.get('/', async (req,res)=>{
    const result = await db.query('SELECT * FROM vendedor')
    res.json(result.rows)
})

router.patch('/:id', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id = parseInt(req.params.id);
        const {  nombre, cargo, telefono, salario,id_consecionario } = req.body;

        let updateQuery = 'UPDATE vendedor SET ';
        const updateValues = [];
        let paramCount = 1;

        if (nombre !== undefined) {
            updateQuery += `nombre = $${paramCount}, `;
            updateValues.push(nombre);
            paramCount++;
        }
        if (cargo !== undefined) {
            updateQuery += `cargo = $${paramCount}, `;
            updateValues.push(cargo);
            paramCount++;
        }
        if (telefono !== undefined) {
            updateQuery += `telefono = $${paramCount}, `;
            updateValues.push(telefono);
            paramCount++;
        }
        if (salario !== undefined) {
            updateQuery += `salario = $${paramCount}, `;
            updateValues.push(salario);
            paramCount++;
        }
        if (id_consecionario !== undefined) {
            updateQuery += `id_consecionario = $${paramCount}, `;
            updateValues.push(id_consecionario);
            paramCount++;
        }

        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
        updateValues.push(id);

        const result = await client.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Vendedor actualizado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar al vendedor', details: err.message });
    } finally {
        client.release();
    }
});

router.delete('/:id', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id = parseInt(req.params.id);
        const query = 'DELETE FROM vendedor WHERE id = $1 RETURNING *';
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Vendedor eliminado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el Vendedor', details: err.message });
    } finally {
        client.release();
    }
});

module.exports = router