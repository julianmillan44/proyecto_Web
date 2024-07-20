const express = require('express');
const router  = express.Router();
const db  = require('../database.js');


router.post('/', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const { id_insumo, nombre, descripcion, precio, id_almacen} = req.body;

        const query = 'INSERT INTO insumo (id_insumo, nombre, descripcion, precio, id_almacen) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const values = [id_insumo, nombre, descripcion, precio, id_almacen];
        
        const result = await client.query(query, values);
        
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Insumo agregado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al agregar el insumo', details: err.message });
    } finally {
        client.release();
    }
});

router.get('/', async (req,res)=>{
    const result = await db.query('SELECT * FROM insumo')
    res.json(result.rows)
})

router.patch('/:id_insumo', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id_insumo = parseInt(req.params.id_insumo);
        const { nombre, descripcion, precio, id_almacen} = req.body;

        let updateQuery = 'UPDATE insumo SET ';
        const updateValues = [];
        let paramCount = 1;

        if (nombre !== undefined) {
            updateQuery += `nombre = $${paramCount}, `;
            updateValues.push(nombre);
            paramCount++;
        }
        if (descripcion !== undefined) {
            updateQuery += `descripcion = $${paramCount}, `;
            updateValues.push(descripcion);
            paramCount++;
        }
        if (precio!== undefined) {
            updateQuery += `precio = $${paramCount}, `;
            updateValues.push(precio);
            paramCount++;
        }
        

        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id_insumo = $${paramCount} RETURNING *`;
        updateValues.push(id_insumo);

        const result = await client.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Insumo actualizado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el insumo', details: err.message });
    } finally {
        client.release();
    }
});

router.delete('/:id_insumo', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id_insumo = parseInt(req.params.id_insumo);
        const query = 'DELETE FROM insumo WHERE id_insumo = $1 RETURNING *';
        const result = await client.query(query, [id_insumo]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Insumo no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Insumo eliminado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el insumo', details: err.message });
    } finally {
        client.release();
    }
});

module.exports = router