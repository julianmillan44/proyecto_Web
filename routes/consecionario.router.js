const express = require('express');
const router  = express.Router();
const db  = require('../database.js');


router.post('/', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const { id_consecionario, nombre, direccion, marcas_distribuidas} = req.body;

        const query = 'INSERT INTO consecionario (id_consecionario, nombre, direccion, marcas_distribuidas) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [id_consecionario, nombre, direccion, marcas_distribuidas];
        
        const result = await client.query(query, values);
        
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Consecionario agregado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al agregar el consecionario', details: err.message });
    } finally {
        client.release();
    }
});

router.get('/', async (req,res)=>{
    const result = await db.query('SELECT * FROM consecionario')
    res.json(result.rows)
})

router.patch('/:id_consecionario', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id_consecionario = parseInt(req.params.id_consecionario);
        const { nombre, direccion, marcas_distribuidas} = req.body;

        let updateQuery = 'UPDATE consecionario SET ';
        const updateValues = [];
        let paramCount = 1;

        if (nombre !== undefined) {
            updateQuery += `nombre = $${paramCount}, `;
            updateValues.push(nombre);
            paramCount++;
        }
        if (direccion !== undefined) {
            updateQuery += `direccion = $${paramCount}, `;
            updateValues.push(direccion);
            paramCount++;
        }
        if (marcas_distribuidas!== undefined) {
            updateQuery += `marcas_distribuidas = $${paramCount}, `;
            updateValues.push(marcas_distribuidas);
            paramCount++;
        }
        

        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id_consecionario = $${paramCount} RETURNING *`;
        updateValues.push(id_consecionario);

        const result = await client.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'COnsecionario no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Consecionario actualizado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el consecionario', details: err.message });
    } finally {
        client.release();
    }
});

router.delete('/:id_consecionario', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const id_consecionario = parseInt(req.params.id_consecionario);
        const query = 'DELETE FROM consecionario WHERE id_consecionario = $1 RETURNING *';
        const result = await client.query(query, [id_consecionario]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Consecionario no encontrado' });
        }

        await client.query('COMMIT');

        res.json({
            message: 'Consecionario eliminado',
            data: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el consecionario', details: err.message });
    } finally {
        client.release();
    }
});

module.exports = router