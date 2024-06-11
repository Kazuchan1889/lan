const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");

//READ UPDATE ADD CUTI
//READ UPDATE IZIN

const countPengajuan = async (req, res) => {
  try {
    const date = new Date();
    const day = await check.getDateOnThisWeek(date.toISOString().split("T")[0]);

    date.setUTCHours(date.getUTCHours() + 7);
    const idk = req.userId;
    const cuti = {
      diterima: 0,
      ditolak: 0,
      menunggu: 0,
    };
    const izin = {
      diterima: 0,
      ditolak: 0,
      menunggu: 0,
    };
    const reimburst = {
      diterima: 0,
      ditolak: 0,
      menunggu: 0,
    };

    const cutiResult = await pool.query(
      `SELECT
      status
      FROM pengajuan
      WHERE idk = $1
      AND tipe = 'cuti'
      and detailpengganti is not null
      and date >= $2
      and date <= $3`,
      [idk, day.monday, day.sunday]
    );

    cutiResult.rows.forEach((item) => {
      if (item.status === true) cuti.diterima++;
      else if (item.status === false) cuti.ditolak++;
      else cuti.menunggu++;
    });

    const izinResult = await pool.query(
      `SELECT
      status
      FROM pengajuan
      WHERE idk = $1
      AND tipe = 'izin'
      and date >= $2
      and date <= $3`,
      [idk, day.monday, day.sunday]
    );

    izinResult.rows.forEach((item) => {
      if (item.status === true) izin.diterima++;
      else if (item.status === false) izin.ditolak++;
      else izin.menunggu++;
    });

    const reimburstResult = await pool.query(
      `SELECT
      status
      FROM reimburst
      WHERE idk = $1
      and date >= $2
      and date <= $3`,
      [idk, day.monday, day.sunday]
    );

    reimburstResult.rows.forEach((item) => {
      if (item.status === true) reimburst.diterima++;
      else if (item.status === false) reimburst.ditolak++;
      else reimburst.menunggu++;
    });

    return res.status(200).json({
      data: { cuti, izin, reimburst },
      message: "data terambil",
      bool: true,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", bool: false });
  }
};

const countAllWaiting = async (req, res) => {
  try {
    const date = new Date();
    const day = await check.getDateOnThisWeek(date.toISOString().split("T")[0]);
    const waitCount = {
      izin: 0,
      cuti: 0,
      reimburst: 0,
    };
    // console.log(day);
    const izin = await pool.query(
      `select
    id
    from pengajuan
    where tipe = 'izin'
    and date >= $1
    and date <= $2
    and status is null`,
      [day.monday, day.sunday]
    );
    const cuti = await pool.query(
      `select
    id
    from pengajuan
    where tipe = 'cuti'
    and date >= $1
    and date <= $2
    and status is null`,
      [day.monday, day.sunday]
    );
    const reimburst = await pool.query(
      `select
    id
    from reimburst
    where
    transaksi >= $1
    and transaksi <= $2
    and status is null`,
      [day.monday, day.sunday]
    );
    waitCount.izin = izin.rowCount;
    waitCount.cuti = cuti.rowCount;
    waitCount.reimburst = reimburst.rowCount;

    return res.status(200).json({
      message: "berikut data yang terambil",
      bool: true,
      data: waitCount,
    });
  } catch (err) {
    return res.status(404).send(err);
  }
};

function updateJatahCuti(tipe, count, id) {
  console.log(tipe, count, id);
  if (!tipe || count === null || !id) return console.log("requirement gk ada");
  let index = 0;
  const queries = [
    "select cutiMandiri,cutiBersama from karyawan where id = $1",
    "update karyawan set cutiMandiri = cutiMandiri - $1 where id = $2",
    "update karyawan set cutiBersama = cutiBersama - $1 where id = $2",
  ];
  if (tipe === "mandiri") index = 1;
  else index = 2;
  pool.query(queries[index], [count, id], (err, result) => {
    if (err) throw err;
  });
}

//fungsi untuk memproses hari absensi dari pengajuan yang diterima
async function processDate(
  idk,
  tipe,
  currDate,
  selesai,
  res,
  count,
  pengajuanid
) {
  try {
    let endDate = new Date(selesai);
    const checkDay = currDate.getDay();

    if (
      checkDay === 6 ||
      checkDay === 0 ||
      check.AbsensiHoliday.some(
        (item) => item.tanggal === currDate.toISOString().split("T")[0]
      )
    ) {
      console.log(currDate.toLocaleDateString("en-US", { weekday: "long" }));
      currDate.setDate(currDate.getDate() + 1);
    } else {
      const result = await pool.query(queries.updatePengajuanIzin[2], [
        idk,
        currDate,
      ]);
      //update if there are already a data
      await newFunction(result);
    }

    if (currDate <= endDate) {
      let nextDate = new Date(currDate);
      count = await processDate(
        idk,
        tipe,
        nextDate,
        endDate,
        res,
        count,
        pengajuanid
      );
    } else {
      return count;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }

  return count;

  async function newFunction(result) {
    const data = pool.query(
      `select alasan,suratsakit from pengajuan where id = $1`,
      [pengajuanid]
    );
    const status =
      tipe === "cuti"
        ? tipe
        : // : (await data).rows[0].alasan.toLowerCase().includes("sakit")
        (await data).rows[0].suratsakit
        ? "sakit"
        : "izin";
    if (result.rowCount > 0) {
      if (result.rows[0].tipe !== status) count++;
      const result2 = await pool.query(queries.updatePengajuanIzin[3], [
        status,
        pengajuanid,
        result.rows[0].id,
      ]);
      console.log(
        `updated with data, ${status} ${result.rows[0].id} ${currDate}`
      );
      currDate.setDate(currDate.getDate() + 1);
    }

    //insert if there are no data yet
    else {
      count++;
      const result2 = await pool.query(queries.updatePengajuanIzin[4], [
        idk,
        status,
        currDate,
        pengajuanid,
      ]);
      console.log(`inserted with data, ${status} ${idk} ${currDate}`);
      currDate.setDate(currDate.getDate() + 1);
    }
  }
}

function countWeekdays(startDate, endDate) {
  let currentDate = new Date(startDate);
  let count = 0;

  while (currentDate <= new Date(endDate)) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    // console.log(count);
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }

  return count;
}

//mendapatkan pengajuan. need operation 'READ_CUTI' or 'READ_IZIN'
const getPengajuan = (req, res) => {
  const jabatan = req.userJabatan;
  const tipe = req.params.tipe;

  console.log(req.body);
  switch (tipe) {
    case "cuti":
      if (check.checkOperation("READ_CUTI", req.userOperation, res)) return;
      break;
    case "izin":
      if (check.checkOperation("READ_IZIN", req.userOperation, res)) return;
      break;
    default:
      return res.status(200).send(`tipe ${tipe} tidak valid`);
  }
  const { search, date } = req.body;
  const sstring = search ? search : "";
  const searchString = "%" + sstring + "%";
  let queriesString =
    tipe === "izin" ? queries.getPengajuan[0] : queries.getPengajuan[1];
  // (jabatan.toLowerCase() === 'direktur' ? queries.getPengajuan[1] : queries.getPengajuan[2]))

  pool.query(queriesString, [tipe, searchString, date], (err, result) => {
    if (err) throw err;
    // console.log(result.rowCount);
    res.status(200).json(result.rows);
  });
};

//mengambil pengajuan mandiri. need operation 'FORM_SELF'
const getPengajuanSelf = (req, res) => {
  if (check.checkOperation("SELF_FORM", req.userOperation, res)) return;

  const tipe = req.params.tipe;
  let queriesString;
  tipe === "izin"
    ? (queriesString = queries.getPengajuanSelf[0])
    : (queriesString = queries.getPengajuanSelf[1]);
  pool.query(queriesString, [tipe, req.userId], (err, result) => {
    if (err) throw err;
    // result.rows.forEach(row=>{

    //     const mulai = new Date(row.mulai)
    //     const selesai = new Date(row.selesai)
    //     mulai.setHours(mulai.getUTCHours())
    //     selesai.setHours(selesai.getUTCHours())
    //     row.mulai = mulai.toISOString().split('T')[0]
    //     row.selesai = selesai.toISOString().split('T')[0]
    // })
    res.status(200).json(result.rows);
  });
};

//ganti jabatan jadi level leader
const getNameAndId = (req, res) => {
  const jabatan = req.userJabatan;
  const divisi = req.userDivisi;
  const level = req.userLevel;

  //jika user merupakan head divisimya, pengganti harus merupakan head juga
  if (level.toLowerCase() === "head") {
    pool.query(
      "select id, nama from karyawan where level = $1 and id != $2 order by nama",
      [level, req.userId],
      (err, result) => {
        if (err) throw err;
        res.status(200).json(result.rows);
      }
    );
  }
  //jika user bukan head, pengganti harus berasal dari divisi yang sama
  else {
    pool.query(
      "select id, nama from karyawan where divisi ilike $1 and id != $2 order by nama",
      [divisi, req.userId],
      (err, result) => {
        if (err) throw err;
        res.status(200).json(result.rows);
      }
    );
  }
};

//mendapatkan pengajuan dengan tipe, dan tanggal. need operation 'READ_CUTI' or 'READ_IZIN'
const getPengajuanDated = (req, res) => {
  const { tipe, search, date } = req.body;
  console.log(req.body);
  switch (tipe) {
    case "cuti":
      if (check.checkOperation("READ_CUTI", req.userOperation, res)) return;
      break;
    case "izin":
      if (check.checkOperation("READ_IZIN", req.userOperation, res)) return;
      break;
    default:
      return res.status(200).send(`tipe ${tipe} tidak valid`);
  }
  pool.query(
    queries.getPengajuanDated,
    [tipe, `%${search}%`, date],
    (err, result) => {
      if (err) throw err;

      res.status(200).json(result.rows);
    }
  );
};

//mengajukan form izin,cuti atau sakit.need operation 'FORM_SELF'
const postPengajuan = async (req, res) => {
  if (check.checkOperation("SELF_FORM", req.userOperation, res)) return;

  const { mulai, selesai, alasan } = req.body;

  console.log(new Date(mulai), new Date(selesai));
  if (new Date(mulai) > new Date(selesai))
    return res
      .status(406)
      .send("tanggal selesai tidak boleh sebelum tanggal mulai");
  const idk = req.userId;
  const tipe = req.params.tipe;
  const date = new Date();
  date.setUTCHours(date.getUTCHours() + 7);
  if (idk) {
    if (tipe === "cuti") {
      const { pengganti, sisaCuti } = req.body;
      const count = await countWeekdays(mulai, selesai);
      console.log(count, sisaCuti);
      if (sisaCuti < count) {
        console.log("kurang jatah");
        return res.status(406).send("jatah cuti kurang");
      }

      // console.log(req.body);
      pool.query(queries.postPengajuanCuti[0], [pengganti], (err, result) => {
        if (err) throw err;
        const idDp = result.rows[0].id;
        pool.query(
          queries.postPengajuanCuti[1],
          [tipe, idk, date, mulai, selesai, alasan, idDp],
          (err2, result2) => {
            if (err2) throw err2;
            return res.status(200).send(`pengajuan ${tipe} berhasil`);
          }
        );
      });
    } else if (tipe === "izin" || tipe === "sakit") {
      const { jenis, image } = req.body;
      if (check.checkDokumenSize(image, res)) return;
      pool.query(
        queries.postPengajuanIzin,
        [tipe, idk, date, mulai, selesai, alasan, image, jenis],
        (err, result) => {
          if (err) throw err;
          return res.status(200).send(`pengajuan ${tipe} berhasil`);
        }
      );
    }
  } else return res.status(200).send(`wadehel`);
};

//untuk menerima atau menolak ajuan izin, need operation 'UPDATE_IZIN'
const updatePengajuanIzin = (req, res) => {
  if (check.checkOperation("UPDATE_IZIN", req.userOperation, res)) return;
  const status = req.params.status;
  const id = req.params.id;
  const { suratsakit } = req.body;
  console.log(`pengajuan no ${id}`);
  pool.query(queries.updatePengajuanIzin[0], [id], (err, result) => {
    if (err) throw err;

    if (result.rowCount > 0) {
      const row = result.rows[0];
      const tipe = row.tipe;
      const mulai = new Date(row.mulai);
      const selesai = new Date(row.selesai);
      const idk = row.idk;
      let count = 0;

      if (tipe === "cuti") {
        return res
          .status(400)
          .send(`id pengajuan yang diberikan ber tipe ${tipe}`);
      }
      pool.query(
        queries.updatePengajuanIzin[1],
        [id, status, suratsakit],
        async (err2, result2) => {
          if (err2) throw err2;

          if (status === "true") {
            mulai.setUTCHours(mulai.getUTCHours() + 7);
            selesai.setUTCHours(selesai.getUTCHours() + 7);

            let currDate = new Date(mulai);

            count = await processDate(
              idk,
              tipe,
              currDate,
              selesai,
              res,
              count,
              id
            ); // Start processing dates
            console.log(count);
          }
          check.saveAudit(
            req.userId,
            `${
              status === "true" ? "menerima" : "menolak"
            } approval ${tipe} dengan id ${id}`
          );
          return res
            .status(200)
            .send(status === "true" ? "data acc" : "data rejected");
        }
      );
    } else {
      res.status(200).send("No pengajuan found");
    }
  });
};

const updatePengajuanCuti = (req, res) => {
  console.log("pengajuan");
  if (check.checkOperation("UPDATE_CUTI", req.userOperation, res)) return;

  const status = req.params.status;
  const id = req.params.id;
  const jabatan = req.userJabatan;
  const operation = req.userOperation;  
  const updateBoolCuti = [
    "update cuti set status_head = $2, progress = $3 where id = $1 returning *",
    "update cuti set status_hr = $2, progress = $3 where id = $1 returning *",
  ];
  let queryIndex = 0;
  console.log(`pengajuan no ${id} jabatan user ${jabatan}`);
  pool.query(
    "select idk,tipe,mulai,selesai,detailpengganti from pengajuan where id = $1",
    [id],
    (err, result) => {
      if (err) throw err;
      if (result.rowCount > 0) {
        let progres = "";
        const { idk, tipe, mulai, selesai, detailpengganti } = result.rows[0];
        if (tipe === "izin") {
          return res
            .status(400)
            .send(`id pengajuan yang diberikan ber tipe ${tipe}`);
        }
        if (jabatan.toLowerCase() === "direktur") {
          console.log("update bool head");
          queryIndex = 0;
          progres = "direktur";
        } else if (operation.includes("UPDATE_CUTI")) {
          console.log("update bool hr");
          progres = "admin";
          queryIndex = 1;
        } else {
          return res
            .status(302)
            .send("user tidak memiliki hak atau bukan direktur");
        }
        pool.query(
          updateBoolCuti[queryIndex],
          [detailpengganti, status, status ? `acc by ${progres}` : `rejected`],
          async (err2, result2) => {
            if (err2) throw err2;
            console.log(result2.rows[0]);
            if (status === "false") {
              pool.query("update pengajuan set status = false where id=$1", [
                id,
              ]);
            }
            pool.query(
              "select * from cuti where id = $1 and status_head = $2 and status_hr = $2",
              [detailpengganti, true],
              (err3, result3) => {
                if (err3) throw err3;
                if (result3.rowCount > 0) {
                  console.log("ubah jadi true");
                  pool.query(
                    "update pengajuan set status = $1 where id = $2",
                    [true, id],
                    async (err4, result4) => {
                      if (err4) throw err4;
                      let count = 0;
                      const currDate = new Date(mulai);
                      count = await processDate(
                        idk,
                        tipe,
                        currDate,
                        selesai,
                        res,
                        count,
                        id
                      );
                      updateJatahCuti("mandiri", count, idk);
                    }
                  );
                }
              }
            );
            const result3 = await pool.query(
              `UPDATE cuti
            SET progress = 
              CASE
                WHEN status_hr = true AND status_head IS NULL THEN 'acc by admin'
                WHEN status_hr IS NULL AND status_head = true THEN 'acc by direktur'
                WHEN status_hr = true AND status_head = true THEN 'accepted'
                WHEN status_hr IS NULL AND status_head IS NULL THEN 'waiting'
                WHEN status_hr = false OR status_head = false THEN 'rejected'
                ELSE 'unknown' -- Add an ELSE clause if you want to handle unexpected cases
              END
            WHERE id = $1
            returning progress
            `,
              [detailpengganti]
            );
            // console.log(result3.rows);
          }
        );
        check.saveAudit(
          req.userId,
          `${status ? "menerima" : "menolak"} approval ${tipe} dengan id ${id}`
        );
        return res.status(200).json({ tipe, mulai, selesai, detailpengganti });
      } else
        return res.status(400).send(`pengajuan dengan id no ${id} tidak ada`);
    }
  );
};

//api untuk mengeset seluruh jatah cuti karyawan, need operation 'UPDATE_CUTI'
const setJatahCuti = (req, res) => {
  if (check.checkOperation("UPDATE_CUTI", req.userOperation, res)) return;

  const { cutiMandiri, cutiBersama } = req.body;

  pool.query(
    queries.setJatahCuti,
    [cutiBersama, cutiMandiri],
    (err, result) => {
      if (err) throw err;
      check.saveAudit(
        req.userId,
        `mengupdate jatah cuti mandiri = ${cutiMandiri}, cuti bersama = ${cutiBersama}`
      );
      return res.status(200).json("Jatah cuti telah di set");
    }
  );
};

//api untuk mengeset absensi sebagai cuti bersama, need operation 'ADD_CUTI'
const setCutiBersama = (req, res) => {
  // if (check.checkOperation("ADD_CUTI", req.userOperation, res)) return;
  const { mulai, selesai, batchId } = req.body;
  console.log(req.body);
  {
    // pool.query(
    //   "select id from karyawan where $1 = any(operation)",
    //   ["SELF_ABSENSI"],
    //   (err, result) => {
    //     if (err) throw err;
    //     if (result.rowCount == 0)
    //       return res.status(200).send("No pengajuan found");
    //     result.rows.forEach(async (row) => {
    //       const id = row.id;
    //       let count = 0;
    //       const status = "cuti";
    //       console.log(id);
    //       let currDate = new Date(mulai);
    //       count = await processDate(id, status, currDate, selesai, res, count);
    //       // console.log(count);
    //       updateJatahCuti("bersama", count, id);
    //     });
    //     check.saveAudit(
    //       req.userId,
    //       `mengeset cuti bersama pada tanggal ${mulai} hingga ${selesai}`
    //     );
    //     return res.status(200).send("data updated");
    //   }
    // );
  }
  if (!batchId)
    return res.status(406).send("tolong memilih karyawan untuk cuti bersama");
  else {
    batchId.forEach(async (id) => {
      const isIdExist = await pool.query(
        "select id from karyawan where id = $1",
        [id]
      );

      if (isIdExist.rowCount > 0) {
        // console.log(id);
        let count = 0;
        const status = "cuti";
        console.log(id);
        let currDate = new Date(mulai);
        count = await processDate(id, status, currDate, selesai, res, count);
        // console.log(count);
        updateJatahCuti("bersama", count, id);
      } else console.log(`id ${id} tidak ada`);
    });
    check.saveAudit(
      req.userId,
      `mengeset cuti bersama pada tanggal ${mulai} hingga ${selesai}`
    );
    return res
      .status(200)
      .send(`user dengan id (${batchId.join(", ")}) akan cuti`);
  }
};

const getCutiSisa = async(req,res)=>{
  const Sisa = await pool.query(queries.getSisaCuti,[req.userId]);
  // console.log(Sisa.rowCount);
  res.status(200).send(Sisa.rows[0])
};

const sisaJatah = async(req,res)=>{
  const Sisa = await pool.query(queries.getSisaCuti,[req.userId]);
  console.log(Sisa.rows);
  console.log(req.userId);
  res.status(200).json(Sisa.rows[0]);
};
module.exports = {
  setCutiBersama,
  getPengajuan,
  getPengajuanSelf,
  getNameAndId,
  getPengajuanDated,
  postPengajuan,
  updatePengajuanIzin,
  updatePengajuanCuti,
  setJatahCuti,
  countPengajuan,
  countAllWaiting,
  sisaJatah,
  getCutiSisa,
};
