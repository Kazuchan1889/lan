const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");

//READ UPDATE

//membuat form remburst, need operation 'FORM_SELF'
const postReimburst = (req, res) => {
  if (check.checkOperation("SELF_FORM", req.userOperation, res)) return;

  const id = req.userId;
  const date = new Date();
  const { biaya, keterangan, tanggal, image } = req.body;
  const progres = "waiting";

  // console.log(biaya, keterangan, tanggal);
  const checkDokumen = check.checkDokumenSize(image, res);
  // console.log(checkDokumen);
  if (checkDokumen) {
    console.log("a");
    return;
  }

  // console.log("a");
  // console.log(biaya, keterangan, tanggal);
  date.setUTCHours(date.getUTCHours() + 7);
  pool.query(
    queries.postReimburst,
    [id, date, biaya, keterangan, tanggal, image, progres],
    (err, result) => {
      if (err) throw err;
      console.log("post reimburst");
      return res.status(200).send("berhasil menambah permintaan reimburst");
    }
  );
};

//memunculkan data remburst, need operation 'READ_REMBURST'
const getReimburst = (req, res) => {
  // console.log(req.body)
  if (check.checkOperation("READ_REIMBURST", req.userOperation, res)) return;
  const { jenis, bulan, year } = req.body;
  console.log(req.body);
  const sql =
    jenis.toLowerCase() === "history"
      ? 0
      : jenis.toLowerCase() === "approval"
      ? 1
      : jenis.toLowerCase() === "accepted"
      ? 2
      : false;
  console.log(sql);
  if (sql === false) return res.status(402).send("jenis tidak valid");
  if (sql <= 1) {
    pool.query(queries.getReimburst[sql], [bulan, year], (err, result) => {
      if (err) throw err;
      res.status(200).json(result.rows);
    });
  } else {
    pool.query(
      queries.getReimburst[sql],
      [bulan, year],
      async (err, result) => {
        if (err) throw err;
        const data = await transformData(result.rows);
        res.status(200).json(data);
      }
    );
  }
};

function transformData(rawData) {
  // console.log(rawData);
  // Create an object to store the transformed data
  const transformedData = {};

  // Iterate through the rawData array
  rawData.forEach((item) => {
    // Create a unique key based on nama and bulan
    const key = `${item.nama}_${item.bulan}`;

    // If the key doesn't exist in transformedData, create an entry
    if (!transformedData[key]) {
      transformedData[key] = {
        nama: item.nama,
        jabatan: item.jabatan,
        norek: item.norek,
        bankname: item.bankname,
        bulan: item.bulan,
        tahun: item.tahun,
        jumlah: item.biaya,
        progres: item.progres,
        detail: [],
      };
    } else {
      const temp1 = rpToInt(transformedData[key].jumlah);
      const temp2 = rpToInt(item.biaya);
      const cal = temp1 + temp2;
      // console.log(temp1, temp2, cal, key);
      transformedData[key].jumlah = intToRp(cal);
      // console.log(transformedData[key].jumlah);
    }

    // Add the detail information to the entry
    transformedData[key].detail.push({
      id: item.id,
      keterangan: item.keterangan,
      biaya: item.biaya,
      date: item.date,
      status: item.status,
    });
  });

  // Convert the transformedData object into an array
  const dataToSend = Object.values(transformedData);

  return dataToSend;
}

const rpToInt = (string) => {
  const resultString = string.toString().replace(/[^0-9]/g, "");

  // Convert to integer
  const resultInt = parseInt(resultString);
  return resultInt;
};

const intToRp = (int) => {
  const formattedCurrency = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(int);

  return formattedCurrency;
};

//memunculkan ajuan remburst mandiri, need operation 'FORM_SELF'
const getReimburstSelf = (req, res) => {
  if (check.checkOperation("SELF_FORM", req.userOperation, res)) return;
  pool.query(queries.getReimburstSelf, [req.userId], (err, result) => {
    if (err) throw err;
    res.status(200).json(result.rows);
  });
};

const updateReimburst = async (req, res) => {
  if (check.checkOperation("UPDATE_REIMBURST", req.userOperation, res)) return;
  const id = req.params.id;
  const status = req.params.status;
  // console.log(id)
  const { rows } = await pool.query(
    "select status,selesai from reimburst where id = $1",
    [id]
  );
  if (rows.length === 0) return res.status(401).send("id reimburst tidak ada");
  // console.log(rows[0].status)
  if (!rows[0].status) {
    check.saveAudit(
      req.userId,
      `${
        status === "true" ? "menerima" : "menolak"
      } approval reimburst dengan id ${id}`
    );
    const progres = status === "true" ? "accepted" : "rejected";
    pool.query(
      "update reimburst set status = $1, progres = $2 where id = $3",
      [status, progres, id],
      (err, result) => {
        if (err) throw err;
        return res.status(200).send("update berhasil");
      }
    );
  } else {
    check.saveAudit(
      req.userId,
      `${
        status === "true" ? "menerima" : "menolak"
      } transfer reimburst dengan id ${id}`
    );
    const progres = status === "true" ? "sudah ditransfer" : "rejected";
    pool.query(
      "update reimburst set selesai = $1, progres = $2 where id = $3",
      [status, progres, id],
      (err, result) => {
        if (err) throw err;
        return res.status(200).send("update berhasil");
      }
    );
  }
};

module.exports = {
  getReimburst,
  getReimburstSelf,
  postReimburst,
  updateReimburst,
};
