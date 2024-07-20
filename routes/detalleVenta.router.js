const express = require('express');
const router  = express.Router();
const db  = require('../database.js');


router.post('/', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const { id_detalle, id_venta, id_producto, tipo_producto, cantidad, precio_unitario, precio_total} = req.body;

        const query = 'INSERT INTO detalleVenta (id_detalle, id_venta, id_producto, tipo_producto, cantidad, precio_unitario, precio_total) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
        const values = [id_detalle, id_venta, id_producto, tipo_producto, cantidad, precio_unitario, precio_total];
        
        const result = await client.query(query, values);
        
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Detalle de la venta agregado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al agregar el detalle a la venta', details: err.message });
    } finally {
        client.release();
    }
});

router.get('/', async (req,res)=>{
    const result = await db.query('SELECT * FROM detalleVenta')
    res.json(result.rows)
})

router.patch('/:id_detalle', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id_detalle = parseInt(req.params.id_detalle);
        const { id_venta, id_producto, tipo_producto, cantidad, precio_unitario, precio_total} = req.body;

        let updateQuery = 'UPDATE detalleVenta SET ';
        const updateValues = [];
        let paramCount = 1;

        if (id_venta !== undefined) {
            updateQuery += `id_venta = $${paramCount}, `;
            updateValues.push(id_venta);
            paramCount++;
        }
        if (id_producto !== undefined) {
            updateQuery += `id_producto = $${paramCount}, `;
            updateValues.push(id_producto);
            paramCount++;
        }
        if (tipo_producto!== undefined) {
            updateQuery += `tipo_producto = $${paramCount}, `;
            updateValues.push(tipo_producto);
            paramCount++;
        }
        if (cantidad!== undefined) {
            updateQuery += `cantidad = $${paramCount}, `;
            updateValues.push(cantidad);
            paramCount++;
        }
        if (precio_unitario!== undefined) {
            updateQuery += `precio_unitario = $${paramCount}, `;
            updateValues.push(tipo_producto);
            paramCount++;
        }
        if (precio_total!== undefined) {
            updateQuery += `precio_total = $${paramCount}, `;
            updateValues.push(precio_total);
            paramCount++;
        }
        

        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id_detalle = $${paramCount} RETURNING *`;
        updateValues.push(id_detalle);

        const result = await client.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Detalle de la venta no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Detalle de la venta actualizado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el detalle de la venta', details: err.message });
    } finally {
        client.release();
    }
});

router.delete('/:id_detalle', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id_detalle = parseInt(req.params.id_detalle);
        const query = 'DELETE FROM detalleVenta WHERE id_detalle = $1 RETURNING *';
        const result = await client.query(query, [id_detalle]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Detalle de la venta no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Detalle eliminado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el detalle de la venta', details: err.message });
    } finally {
        client.release();
    }
});

module.exports = router