const mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    database: 'naac_criterian',
    user: 'root',
    password: 'Lkjhg@4321'
});

const pool = mysql.createPool;


module.exports = connection;