const mysql = require('mysql2/promise');

const pool = mysql.createPool({
	host: process.env.HOST,
	port: process.env.PORT,
	user: process.env.USER_NAME,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
});

module.exports = pool;
