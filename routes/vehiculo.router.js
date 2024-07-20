const express = require('express');
const router  = express.Router();
const db  = require('../database.js');


router.post('/', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const { id, marca, modelo, modelo_year, precio,id_consecionario } = req.body;

        const query = 'INSERT INTO vehiculos ( id, marca, modelo, modelo_year, precio,id_consecionario) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [ id, marca, modelo, modelo_year, precio,id_consecionario];
        
        const result = await client.query(query, values);
        
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Vehiculo agregado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al agregar el vehiculo', details: err.message });
    } finally {
        client.release();
    }
});

router.get('/', async (req,res)=>{
    const result = await db.query('SELECT * FROM vehiculos')
    res.json(result.rows)
})

router.patch('/:id', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id = parseInt(req.params.id);
        const { marca, modelo, modelo_year, precio,id_consecionario } = req.body;

        let updateQuery = 'UPDATE vehiculos SET ';
        const updateValues = [];
        let paramCount = 1;

        if (marca !== undefined) {
            updateQuery += `marca = $${paramCount}, `;
            updateValues.push(marca);
            paramCount++;
        }
        if (modelo !== undefined) {
            updateQuery += `modelo = $${paramCount}, `;
            updateValues.push(modelo);
            paramCount++;
        }
        if (modelo_year !== undefined) {
            updateQuery += `modelo_year = $${paramCount}, `;
            updateValues.push(modelo_year);
            paramCount++;
        }
        if (precio !== undefined) {
            updateQuery += `precio = $${paramCount}, `;
            updateValues.push(precio);
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
            return res.status(404).json({ message: 'Vehiculo no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Vehiculo actualizado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el vehiculo', details: err.message });
    } finally {
        client.release();
    }
});

router.delete('/:id', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id = parseInt(req.params.id);
        const query = 'DELETE FROM vehiculos WHERE id = $1 RETURNING *';
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Vehiculo no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Vehiculo eliminado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el vehiculo', details: err.message });
    } finally {
        client.release();
    }
});

module.exports = router