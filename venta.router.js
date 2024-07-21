const express = require('express');
const router  = express.Router();
const db  = require('../database.js');
const { sendEmail } = require('../mailer.js'); 


router.post('/', async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const { id, fecha, id_cliente, id_vendedor, precio_total } = req.body;

        // Insertar la venta
        const ventaQuery = 'INSERT INTO venta (id, fecha, id_cliente, id_vendedor, precio_total) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const ventaValues = [id, fecha, id_cliente, id_vendedor, precio_total];
        const ventaResult = await client.query(ventaQuery, ventaValues);
        
        // Obtener la información del cliente, incluyendo el correo
        const clienteQuery = 'SELECT * FROM clientes WHERE id = $1';
        const clienteResult = await client.query(clienteQuery, [id_cliente]);
        const cliente = clienteResult.rows[0];

        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }

        // Obtener la información del vendedor
        const vendedorQuery = 'SELECT * FROM vendedor WHERE id = $1';
        const vendedorResult = await client.query(vendedorQuery, [id_vendedor]);
        const vendedor = vendedorResult.rows[0];

        if (!vendedor) {
            throw new Error('Vendedor no encontrado');
        }

        await client.query('COMMIT');

        // Enviar correo al cliente
        const emailSubject = 'Confirmación de venta';
        const emailText = `Estimado/a ${cliente.nombre}, gracias por su compra. El monto total es de ${precio_total}. Su vendedor fue ${vendedor.nombre}.`;
        const emailHtml = `
            <h1>Confirmación de venta</h1>
            <p>Estimado/a ${cliente.nombre},</p>
            <p>Gracias por su compra realizada el ${fecha}.</p>
            <p>El monto total es de ${precio_total}.</p>
            <p>Su vendedor fue ${vendedor.nombre}.</p>
            <p>Saludos cordiales,</p>
            <p>Tu Concesionario</p>
        `;

        await sendEmail(cliente.correo, emailSubject, emailText, emailHtml);

        res.status(201).json({
            message: 'Venta agregada y correo enviado',
            data: ventaResult.rows[0]
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
        if (precio_total !== undefined) {
            updateQuery += `precio_total = $${paramCount}, `,
            updateValues.push(precio_total);
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