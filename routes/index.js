const express = require('express')

const clientesRouter = require('./clientes.router');
const consecionarioRouter = require('./consecionario.router');
const detalleVentaRouter = require('./detalleVenta.router');
const insumoRouter = require('./insumo.router');
const almacenRouter = require('./almacen.router');
const ventaRouter = require('./venta.router');
const vendedorRouter = require('./vendedor.router');
const vehiculoRouter = require('./vehiculo.router');



function rutas(proyecto){
    const router = express.Router();
    proyecto.use('/api/v1', router)

    router.use('/clientes', clientesRouter)
    router.use('/consecionario', consecionarioRouter)
    router.use('/detalleVenta', detalleVentaRouter)
    router.use('/insumo', insumoRouter)
    router.use('/almacen', almacenRouter)
    router.use('/venta', ventaRouter)
    router.use('/vendedor', vendedorRouter)
    router.use('/vehiculo', vehiculoRouter)




}

module.exports = rutas;