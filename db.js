const Pool = require('pg').Pool;


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'blood_Donation',
  password: 'Wahab@123',
  port: 5432
})

module.exports = pool;


