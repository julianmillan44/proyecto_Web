const  {Pool} = require('pg');
const dbconfig  = require('./dbconfig.js');

const pool = new Pool(dbconfig)

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect()
  };

