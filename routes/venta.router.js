const express = require('express');
const router  = express.Router();
const db  = require('../database.js');


router.post('/', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const { id, fecha, id_cliente, id_vendedor, precio_total} = req.body;

        const query = 'INSERT INTO venta (id, fecha, id_cliente, id_vendedor, precio_total) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const values = [id, fecha, id_cliente, id_vendedor, precio_total];
        
        const result = await client.query(query, values);
        
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Venta agregada',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al agregar la venta', details: err.message });
    } finally {
        client.release();
    }
});

router.get('/', async (req,res)=>{
    const result = await db.query('SELECT * FROM venta')
    res.json(result.rows)
})

router.patch('/:id', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id = parseInt(req.params.id);
        const { fecha, id_cliente, id_vendedor, precio_total} = req.body;

        let updateQuery = 'UPDATE venta SET ';
        const updateValues = [];
        let paramCount = 1;

        if (fecha !== undefined) {
            updateQuery += `fecha = $${paramCount}, `;
            updateValues.push(fecha);
            paramCount++;
        }
        if (id_cliente !== undefined) {
            updateQuery += `id_cliente = $${paramCount}, `;
            updateValues.push(id_cliente);
            paramCount++;
        }
        if (id_vendedor!== undefined) {
            updateQuery += `id_vendedor = $${paramCount}, `;
            updateValues.push(id_vendedor);
            paramCount++;
        }
        

        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
        updateValues.push(id);

        const result = await client.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Venta actualizada',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar la venta', details: err.message });
    } finally {
        client.release();
    }
});

router.delete('/:id', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id = parseInt(req.params.id);
        const query = 'DELETE FROM venta WHERE id = $1 RETURNING *';
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Venta eliminada',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar la venta', details: err.message });
    } finally {
        client.release();
    }
});

module.exports = router