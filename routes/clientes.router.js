const express = require('express');
const router  = express.Router();
const db  = require('../database.js');


router.post('/', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const { id, nombre, apellido, telefono, correo,id_consecionario } = req.body;

        const query = 'INSERT INTO clientes (id, nombre, apellido, telefono, correo,id_consecionario) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [id, nombre, apellido, telefono, correo,id_consecionario];
        
        const result = await client.query(query, values);
        
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Cliente agregado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al agregar el cliente', details: err.message });
    } finally {
        client.release();
    }
});

router.get('/', async (req,res)=>{
    const result = await db.query('SELECT * FROM clientes')
    res.json(result.rows)
})

router.patch('/:id', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id = parseInt(req.params.id);
        const { nombre, apellido, telefono, correo, id_consecionario } = req.body;

        let updateQuery = 'UPDATE clientes SET ';
        const updateValues = [];
        let paramCount = 1;

        if (nombre !== undefined) {
            updateQuery += `nombre = $${paramCount}, `;
            updateValues.push(nombre);
            paramCount++;
        }
        if (apellido !== undefined) {
            updateQuery += `apellido = $${paramCount}, `;
            updateValues.push(apellido);
            paramCount++;
        }
        if (telefono !== undefined) {
            updateQuery += `telefono = $${paramCount}, `;
            updateValues.push(telefono);
            paramCount++;
        }
        if (correo !== undefined) {
            updateQuery += `correo = $${paramCount}, `;
            updateValues.push(correo);
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
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Cliente actualizado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el cliente', details: err.message });
    } finally {
        client.release();
    }
});

router.delete('/:id', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id = parseInt(req.params.id);
        const query = 'DELETE FROM clientes WHERE id = $1 RETURNING *';
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Cliente eliminado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el cliente', details: err.message });
    } finally {
        client.release();
    }
});

module.exports = router