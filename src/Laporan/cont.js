const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");

//READ LAPORAN
function getStartAndEndWeek(date) {
  const today = new Date(date);
  const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

  // Calculate Monday of the current week
  const monday = new Date(today);
  monday.setUTCHours(monday.getUTCHours() + 7);
  monday.setDate(today.getDate() - (currentDayOfWeek - 1));
  // Calculate Friday of the current week
  const friday = new Date(today);
  friday.setUTCHours(friday.getUTCHours() + 7);
  friday.setDate(today.getDate() + (5 - currentDayOfWeek));

  return {
    monday: monday.toISOString().split("T")[0],
    friday: friday.toISOString().split("T")[0],
  };
}

function dapetJam(date) {
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const time = `${hours}:${minutes}`;

  return time;
}
//memunculkan laporan, memeurlukan operation READ_LAPORAN
const getLaporan = (req, res) => {
  if (check.checkOperation("READ_LAPORAN", req.userOperation, res)) return;
  let { date, jenis, tipe } = req.body;
  console.log(req.body);
  const utc = new Date(date);
  const today = new Date();
  utc.setUTCHours(utc.getUTCHours() + 7);
  today.setUTCHours(today.getUTCHours() + 7);

  // console.log(utc);
  if (tipe === "harian") {
    pool.query(
      queries.getLaporan,
      [date ? utc : today, jenis],
      (err, result) => {
        if (err) throw err;
        if (result.rowCount > 0) {
          res.status(200).json(result.rows);
          // console.log(result.rows);
        } else res.status(200).send("tidak menemukan data");
      }
    );
  } else if (tipe === "mingguan") {
    const allDates = getStartAndEndWeek(date ? utc : today);
    pool.query(
      queries.getLaporanMingguan,
      [allDates.monday, allDates.friday, jenis],
      (err, result) => {
        if (err) throw err;
        if (result.rowCount > 0) {
          res.status(200).json(result.rows);
          // console.log(result.rows);
        } else res.status(200).send("tidak menemukan data");
      }
    );
  } else return res.status(400).send(`tipe ${tipe} tidak valid`);
};

//
const getLaporanSelf = (req, res) => {
  if (check.checkOperation("SELF_FORM", req.userOperation, res)) return;

  const id = req.userId;
  pool.query(queries.getLaporanSelf, [id], async (err, result) => {
    if (err) throw err;
    if (result.rowCount > 0) {
      return res.status(200).json(result.rows);
    } else return res.status(200).send("tidak menemukan data");
  });
};

function isOntime(tanggal) {
  const checkTanggal = new Date(tanggal);
  checkTanggal.setUTCHours(checkTanggal.getUTCHours() + 7);
  console.log(checkTanggal.toISOString());
  const submitDate = new Date();
  submitDate.setUTCHours(submitDate.getUTCHours() + 7);
  console.log(submitDate.toISOString());
  const nextDay = new Date(tanggal);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  nextDay.setUTCHours(nextDay.getUTCHours() + 7);
  console.log(nextDay.toISOString());
  console.log(nextDay.getUTCDay());
  console.log(submitDate.getUTCHours());
  if (nextDay.getUTCDay() === 0 || nextDay.getUTCDay() === 6) {
    console.log("weekend");
    nextDay.setUTCDate(
      nextDay.getUTCDate() +
        ((nextDay.getUTCDay() + 1) % 6) +
        (nextDay.getUTCDay() === 0 ? 0 : 1)
    );
    console.log(nextDay.toISOString());
  }
  return (
    submitDate.getDate() === checkTanggal.getDate() ||
    (nextDay.getDate() === submitDate.getDate() &&
      submitDate.getUTCHours() < 12)
  );
}

async function isLaporanNeeded(tanggal, id) {
  const result = await pool.query(
    `select
  status
  from absensi
  where
  idk = $1
  and date = $2`,
    [id, tanggal]
  );
  console.log(result.rowCount);
  if (result.rowCount == 0) {
    return {
      bool: false,
      status: "tidak ada kehadiran di hari tersebut",
    };
  } else if (
    result.rows[0].status.toLowerCase() === "terlambat" ||
    result.rows[0].status.toLowerCase() === "masuk"
  ) {
    return {
      bool: true,
      status: result.rows[0].status,
    };
  } else
    return {
      bool: false,
      status: result.rows[0].status,
    };
}

//post laporan, memerlukan operation FORM_SELF
const postLaporan = async (req, res) => {
  if (check.checkOperation("SELF_FORM", req.userOperation, res)) return;
  const { lokasi, keterangan, jenis, dokumen, tanggal, time } = req.body;

  if (dokumen) {
    if (dokumen[0] && check.checkDokumenSize(dokumen[0], res)) return;
    if (dokumen[1] && check.checkDokumenSize(dokumen[1], res)) return;
  }
  const isReqValid = await check.checkIsRequirementValid({
    lokasi,
    keterangan,
    jenis,
    tanggal,
    time,
  });
  const id = req.userId;

  //check req dan apakah dibutuhkan untuk membuatlaporan
  {
    if (!isReqValid.bool) {
      return res.status(402).send(isReqValid.message);
    }
    const isNeeded = await isLaporanNeeded(tanggal, id);
    if (!isNeeded.bool) {
      return res.status(402).json({
        message: `user sedang ${isNeeded.status} pada tanggal tersebut`,
      });
    }
  }
  // console.log(req.body);
  const date = new Date();
  date.setUTCHours(date.getUTCHours() + 7);
  if (date.toISOString().split("T")[0] < tanggal)
    return res
      .status(402)
      .send(`tidak bisa menambahkan laporan untuk hari kedepan`);
  const ontime = isOntime(tanggal);
  let idl = null;

  pool.query(
    queries.postLaporan,
    [id, date, lokasi, keterangan, jenis, dokumen, tanggal, ontime, time],
    (err, result) => {
      if (err) throw err;
      // console.log(result.rows[0]);
      res.status(200).send("laporan berhasil disubmit");
    }
  );
};

module.exports = {
  getLaporan,
  getLaporanSelf,
  postLaporan,
};
