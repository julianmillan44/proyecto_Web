const express = require('express');
const router  = express.Router();
const db  = require('../database.js');


router.post('/', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const { id_almacen, nombre, ubicacion } = req.body;

        const query = 'INSERT INTO almacen (id_almacen, nombre, ubicacion) VALUES ($1, $2, $3) RETURNING *';
        const values = [id_almacen, nombre, ubicacion];
        
        const result = await client.query(query, values);
        
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Almacen agregado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK'); //revierte la transacción actual y hace que se descarten todas las actualizaciones realizadas por la transacción
        console.error(err);
        res.status(500).json({ error: 'Error al agregar el almacen', details: err.message });
    } finally {
        client.release();
    }
});

router.get('/', async (req,res)=>{
    const result = await db.query('SELECT * FROM almacen')
    res.json(result.rows)
})

router.patch('/:id_almacen', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id_almacen = parseInt(req.params.id_almacen);
        const { nombre, ubicacion} = req.body;

        let updateQuery = 'UPDATE almacen SET ';
        const updateValues = [];
        let paramCount = 1;

        if (nombre !== undefined) {
            updateQuery += `nombre = $${paramCount}, `;
            updateValues.push(nombre);
            paramCount++;
        }
        if (ubicacion !== undefined) {
            updateQuery += `ubicacion = $${paramCount}, `;
            updateValues.push(ubicacion);
            paramCount++;
        }
       
        

        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id_almacen = $${paramCount} RETURNING *`;
        updateValues.push(id_almacen);

        const result = await client.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Almacen no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Almacen actualizado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK'); //Rollback 
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el almacen', details: err.message });
    } finally {
        client.release();
    }
});

router.delete('/:id_almacen', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id_almacen = parseInt(req.params.id_almacen);
        const query = 'DELETE FROM almacen WHERE id_almacen = $1 RETURNING *';
        const result = await client.query(query, [id_almacen]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Almacen eliminado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el almacen', details: err.message });
    } finally {
        client.release();
    }
});

module.exports = router