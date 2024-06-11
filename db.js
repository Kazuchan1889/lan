const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "HBM",
  password: "Diona188",
  port: 5432,
});

module.exports = pool;
