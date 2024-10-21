const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");

//READ AND uPDATE

const updateAbsensiSetting = (req, res) => {
  if (check.checkOperation("UPDATE_ABSENSI", req.userOperation, res)) return;
  check.saveAudit(req.userId, "mengupdate jam masuk");
  const { masuk, keluar } = req.body;
  // console.log(req);
  check.jamMasuk.jam = masuk.jam ?? check.jamMasuk.jam;
  check.jamMasuk.menit = masuk.menit ?? check.jamMasuk.menit;
  check.toleransiMasuk = masuk.toleransi ?? check.toleransiMasuk;
  check.jamKeluar.jam = keluar.jam ?? check.jamKeluar.jam;
  check.jamKeluar.menit = keluar.menit ?? check.jamKeluar.menit;

  return res.status(200).send(
    `jam masuk ter set ke ${
      check.jamMasuk.jam < 10 ? `0${check.jamMasuk.jam}` : check.jamMasuk.jam
    }:${
      check.jamMasuk.menit < 10
        ? `0${check.jamMasuk.menit}`
        : check.jamMasuk.menit
    } dengan toleransi ${check.toleransiMasuk}\n
      jam keluar ter set ke ${
        check.jamKeluar.jam < 10
          ? `0${check.jamKeluar.jam}`
          : check.jamKeluar.jam
      }:${
      check.jamKeluar.menit < 10
        ? `0${check.jamKeluar.menit}`
        : check.jamKeluar.menit
    }
      `
  );
};

const getAbsensiTime = (req, res) => {
  const data = {
    masuk: {
      jam: check.jamMasuk.jam,
      menit: check.jamMasuk.menit,
      toleransi: check.toleransiMasuk,
    },
    keluar: {
      jam: check.jamKeluar.jam,
      menit: check.jamKeluar.menit,
    },
  };

  res.status(200).send(data);
};

const getAbsensiHoliday = (req, res) => {
  return res.status(200).send(check.AbsensiHoliday);
};

const absensiHoliday = async (req, res) => {
  try {
    const { data } = req.body;
    console.log(data);
    const currentYear = new Date().getFullYear();
    check.AbsensiHoliday = data.filter(
      (item) => item.tanggal.split("-")[0] === currentYear.toString()
    );

    return res.status(200).send("absensi holiday set");
  } catch (error) {
    console.log(error);
    return res.status(300).send(error);
  }
};

const getAbsensi = (req, res) => {
  if (check.checkOperation("READ_ABSENSI", req.userOperation, res)) return;

  pool.query(queries.getAbsensi, (err, result) => {
    if (err) throw err;
    res.status(200).json(result.rows);
  });
};

const getAbsensiDated = (req, res) => {
  if (check.checkOperation("READ_ABSENSI", req.userOperation, res)) return;
  // console.log(req.body);
  const { date, search } = req.body;
  const utc = new Date(date);
  const today = new Date();
  utc.setUTCHours(utc.getUTCHours() + 7);
  today.setUTCHours(today.getUTCHours() + 7);
  //console.log(utc, date)
  pool.query(
    queries.getAbsensiDated,
    [date ? utc : today, `%${search ? search : ""}%`],
    (err, result) => {
      if (err) throw err;
      res.status(200).json(result.rows);
    }
  );
};

const getAbsensiStatusToday = (req, res) => {
  if (check.checkOperation("READ_ABSENSI", req.userOperation, res)) return;
  const date = new Date();
  const status = [
    "masuk",
    "cuti",
    "izin",
    "sakit",
    "tanpa alasan",
    "terlambat",
  ];
  const data = [9, 9, 9, 9, 9, 9];

  const promises = status.map((s, index) => {
    return new Promise((resolve, reject) => {
      pool.query(queries.getAbsensiStatusToday, [date, s], (err, result) => {
        if (err) reject(err);
        data[index] = result.rowCount;
        resolve();
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
};

const getAbsensiMonthlyID = (req, res) => {
  if (check.checkOperation("SELF_ABSENSI", req.userOperation, res)) return;

  const id = req.userId;
  const currDate = new Date();
  const month = currDate.getMonth() + 1;
  const status = [
    "masuk",
    "cuti",
    "izin",
    "sakit",
    "tanpa alasan",
    "terlambat",
  ];
  const data = [9, 9, 9, 9, 9, 9];

  const promises = status.map((s, index) => {
    return new Promise((resolve, reject) => {
      pool.query(queries.getAbsensiMonthlyID, [id, month, s], (err, result) => {
        if (err) reject(err);
        data[index] = result.rowCount;
        resolve();
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
};

const checkAbsensiTodaySelf = async (req, res) => {
  if (check.checkOperation("SELF_ABSENSI", req.userOperation, res)) return;
  const date = new Date();
  date.setUTCHours(date.getUTCHours() + 7);
  const result = await pool.query(queries.checkAbsensiTodaySelf, [
    req.userId,
    date,
  ]);
  // console.log(result.rows, date);
  if (result.rowCount === 1) {
    // console.log(result.rows[0]);
    return res.status(200).json(result.rows[0]);
  } else {
    const response = {
      status: null,
      masuk: null,
      keluar: null,
      currtime: `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`,
    };
    // console.log(response);
    return res.status(200).json(response);
  }
};

const patchInOutByID = (req, res) => {
  if (check.checkOperation("SELF_ABSENSI", req.userOperation, res)) return;

  const id = req.userId;
  const date = new Date();
  const condition = req.params.condition;
  const { fotomasuk, fotokeluar } = req.body;
  date.setUTCHours(date.getUTCHours() + 7);

  pool.query(
    "select * from absensi where idk = $1 and date = $2",
    [id, date],
    (err, result) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send('Internal Server Error');
      }

      if (result.rowCount === 0) {
        pool.query(
          "insert into absensi (idk,date,status) values ($1,$2,$3) returning *",
          [id, date, "tanpa alasan"],
          (err2, result2) => {
            if (err2) {
              console.error('Database insert error:', err2);
              return res.status(500).send('Internal Server Error');
            }
            processCondition(condition, fotomasuk, fotokeluar, id, date, res);
          }
        );
      } else {
        const status = result.rows[0].status;

        if (
          status === null ||
          status === "masuk" ||
          status === "tanpa alasan" ||
          status === "terlambat"
        ) {
          processCondition(condition, fotomasuk, fotokeluar, id, date, res); 
        } else {
          res.status(200).send(`sudah ada absensi dengan status ${status}`);
        }
      }
    }
  );
};

function processCondition(condition,fotomasuk,fotokeluar, id, date, res) {
  if (condition == "masuk") {
    pool.query(
      "select * from absensi where idk =$1 and date = $2 and masuk is not null",
      [id, date],
      (err, result0) => {
        if (err) throw err;
        if (result0.rowCount > 0) {
          res.status(200).send("user telah masuk");
        } else {
          const checkStatus = new Date();
          checkStatus.setUTCHours(check.jamMasuk.jam);
          checkStatus.setUTCMinutes(
            check.jamMasuk.menit + check.toleransiMasuk
          );
          const status = date < checkStatus ? "masuk" : "terlambat";
          //console.log(checkStatus,status)
          pool.query(
            queries.patchAbsensiByID[0],
            [status, fotomasuk, id, date],
            (err, result) => {
              if (err) throw err;
              // console.log(result.rows)
              res.status(200).send("user berhasil masuk");
            }
          );
        }
      }
    );
  } else if (condition == "keluar") {
    // Hilangkan pengecekan waktu agar user bisa check-out kapan saja
    pool.query(
      "select * from absensi where idk =$1 and date = $2 and keluar is not null",
      [id, date],
      (err, result0) => {
        if (err) throw err;
        if (result0.rowCount > 0) {
          res.status(200).send("lu udah keluar");
        } else {
          pool.query(queries.patchAbsensiByID[1], [fotokeluar ,id, date], (err, result) => {
            if (err) throw err;
            // console.log(result.rows)
            res.status(200).send("user keluar");
          });
        }
      }
    );
  } else {
    res.status(400).send("Invalid condition");
  }
}

const checkDay = (date) => {
  const currDate = date.toISOString().split("T")[0];
  const checkDay = date.getDay();

  const hari = {
    minggu: 0,
    senin: 1,
    selasa: 2,
    rabu: 3,
    kamis: 4,
    jumat: 5,
    sabtu: 6,
  };

  if (
    check.AbsensiHoliday.some((item) => item.tanggal === currDate) ||
    checkDay === hari.sabtu ||
    checkDay === hari.minggu
  )
    return "libur";
  else return "tanpa alasan";
};

const postAbsensiToday = () => {
  const date = new Date();
  // console.log(date)
  let addData = 0;
  date.setUTCHours(date.getUTCHours() + 7);

  const status = checkDay(date);
  pool.query(queries.postAbsensiToday[0], (err, result) => {
    if (err) throw err;

    result.rows.forEach((row) => {
      // console.log(row)
      const id = row.id;
      // const role = row.role;
      let jumlah = 0;

      //check jika absensi dengan id karyawan tertentu telah terbuat
      pool.query(
        "select * from absensi where idk = $1 and date = $2",
        [id, date],
        (err2, result2) => {
          if (err2) throw err2;
          jumlah = result2.rowCount;
          if (jumlah === 0) {
            //inisiasi post absensi dengan value status tanpa keterangan
            pool.query(
              queries.postAbsensiToday[1],
              [id, status, date],
              (err2, result2) => {
                if (err2) throw err2;
              }
            );
            addData++;
          }
        }
      );

      //check pengajuan dengan status disetujui
      pool.query(queries.postAbsensiToday[2], [date, id], (err, result2) => {
        if (err) throw err;
        //jika karyawan memiliki pengajuan yang di setujui ganti status di absensi dengan tipe pengajuan
        if (result2.rowCount > 0) {
          result2.rows.forEach((row2) => {
            const tipe = row2.tipe;
            pool.query(
              queries.postAbsensiToday[3],
              [tipe, id, date],
              (err, result3) => {
                if (err) throw err;
                // console.log(tipe)
              }
            );
          });
        }
      });
    });
    // res.status(200).send(addData + `data added`);
  });
};

const patchStatusById = async (req, res) => {
  const { id, status } = req.body;
  console.log(req.body);
  try {
    const result = await pool.query(queries.patchStatus, [status, id]);
    console.log(result.rows);
    return res.status(200).send(result.rows);
  } catch (error) {
    return res.sattus(300).send(error);
  }
};

module.exports = {
  checkAbsensiTodaySelf,
  getAbsensi,
  getAbsensiDated,
  getAbsensiStatusToday,
  getAbsensiMonthlyID,
  getAbsensiTime,
  patchInOutByID,
  patchStatusById,
  postAbsensiToday,
  updateAbsensiSetting,
  getAbsensiHoliday,
  absensiHoliday,
};
