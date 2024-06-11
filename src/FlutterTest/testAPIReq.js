const pool = require("../../db");
const { Router } = require("express");

const router = Router();

const test = (req, res) => {
  const { nama, age, array } = req.body;
  // console.log(req.body);
  // console.log(nama, age, array);
  return res.status(200).json(req.body);
};

const getNameAndIdOnly = async (req, res) => {
  // console.log("kepanggil");
  const { rows } = await pool.query(
    `select id,nama from karyawan order by nama`
  );
  // console.log(rows);
  return res.status(200).send(rows);
};

const controllOperation = async (req, res) => {
  const operation = await pool.query("select operation from operation");

  const flatArray = operation.rows.map((item) => Object.values(item)[0]);
  // console.log(operation.rows, flatArray);

  pool.query(`select operation,id from karyawan`, async (err, result) => {
    await result.rows.forEach(async (row) => {
      // console.log(`id ${row.id} start ${row.operation}`);
      row.operation = await row.operation.filter((value) =>
        flatArray.includes(value)
      );

      // console.log(`id ${row.id} end ${row.operation}`);

      const update = await pool.query(
        `update karyawan set operation = $1 where id = $2 returning id,operation`,
        [row.operation, row.id]
      );

      // console.log(update.rows);
    });
  });

  return res.status(200).send(operation.rows);
};

router.post("/test", test);
router.get("/nama&id", getNameAndIdOnly);
router.get("/control", controllOperation);

module.exports = router;
