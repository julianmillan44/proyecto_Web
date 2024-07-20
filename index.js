const express = require('express');
const rutas = require('./routes')
const proyecto = express();
const port = 3000;
proyecto.use(express.json());

rutas(proyecto);

proyecto.listen(port, ()=>{
    console.log(`El servidor a iniciado correctamente en http://localhost:${port}`);
})