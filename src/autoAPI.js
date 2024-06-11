const cron = require("node-cron");
const postAbsensiToday = require("../src/Absensi/cont");
const pool = require("../db");
const check = require("../public");

const autocheckout = async () => {
  const date = new Date();
  date.setUTCHours(date.getUTCHours() + 7);
  const karyawan = await pool.query(`
  select
  id
  from
  karyawan
  where
  status != 'resign'`);

  for (const row of karyawan.rows) {
    const result = await pool.query(
      `
    update
    absensi
    set
    keluar = now()
    where
    date = $1
    and masuk is not null
    and keluar is null
    and (status = 'masuk' or status = 'terlambat')
    and idk = $2
    returning *`,
      [date, row.id]
    );
    // console.log(result.rows);
  }

  return;
};

// const controllOperation = async () => {
//   const operation = await pool.query("select operation from operation");

//   // console.log("update valid operation");

//   const flatArray = operation.rows.map((item) => Object.values(item)[0]);
//   // console.log(operation.rows, flatArray);

//   pool.query(`select operation,id from karyawan`, async (err, result) => {
//     await result.rows.forEach(async (row) => {
//       // console.log(`id ${row.id} start ${row.operation}`);
//       row.operation = await row.operation.filter((value) =>
//         flatArray.includes(value)
//       );

//       // console.log(`id ${row.id} end ${row.operation}`);

//       const update = await pool.query(
//         `update karyawan set operation = $1 where id = $2 returning id,operation`,
//         [row.operation, row.id]
//       );

//       // console.log(update.rows);
//     });
//   });
// };

//auto add data absen

cron.schedule("30 7 * * *", () => {
  check.initiateAbsence();
});

//auto checkout absen saat jam 19.00
cron.schedule("0 19 * * *", () => {
  autocheckout();
  check.controllOperation();
});
