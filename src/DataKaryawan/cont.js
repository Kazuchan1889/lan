const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");

//READ DELETE UPDATE AND ADD DATA KARYAWAN

const getDataKaryawan = (req, res) => {
  if (check.checkOperation("READ_KARYAWAN", req.userOperation, res)) return;

  pool.query(queries.getDataKaryawan, (err, result) => {
    if (err) return res.status(401).send(err);
    res.status(200).json(result.rows);
  });
};

//mendapatkan info pribadi
const getKaryawanSelf = (req, res) => {
  pool.query(queries.getDataKaryawanById, [req.userId], (err, result) => {
    if (err) return res.status(401).send(err);
    res.status(200).json(result.rows);
  });
};

const getDataKaryawanById = (req, res) => {
  //if(check.checkOperation("READ_KARYAWAN",req.userOperation,res)) return

  pool.query(queries.getDataKaryawanById, [req.params.id], (err, result) => {
    if (err) return res.status(401).send(err);
    res.status(200).json(result.rows);
  });
};
//medapatkan data karyawan, need operation 'READ_KARYAWAN'
const searchDataKaryawan = (req, res) => {
  if (check.checkOperation("READ_KARYAWAN", req.userOperation, res)) return;

  const sstring = req.body.search ? req.body.search : "";
  const searchString = "%" + sstring + "%";
  pool.query(queries.searchDataKaryawan, [searchString], (err, result) => {
    if (err) return res.status(401).send(err);
    res.status(200).json(result.rows);
  });
};

//mendapatkan status kerja dari seluruh karyawan. need operation 'READ_KARYAWAN'
const getDataKaryawanStatus = (req, res) => {
  if (check.checkOperation("READ_KARYAWAN", req.userOperation, res)) return;

  const status = ["tetap", "kontrak", "probation", "magang", "resign"];
  const data = [0, 0, 0, 0, 0];

  const promises = status.map((s, index) => {
    return new Promise((resolve, reject) => {
      pool.query(queries.getDataKaryawanStatus, [s], (err, result) => {
        if (err) reject(err);
        // console.log(s,result.rowCount)
        data[index] = result.rowCount;
        resolve();
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      // console.log(data)
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
};

//menghapus data karyawan berdasarkan id, need operation 'DELETE_KARYAWAN'
const deleteDataKaryawanById = (req, res) => {
  if (check.checkOperation("DELETE_KARYAWAN", req.userOperation, res)) return;
  const id = req.params.id;
  pool.query(queries.deleteDataKaryawanById, [id], (err, result) => {
    if (err) return res.status(401).send(err);
    check.saveAudit(
      req.userId,
      `menghapus data karyawan dengan nama ${result.rows[0].nama}`
    );
    // console.log(`data karyawan dengan id : ${id} dihapus`)
    res.status(201).send("data deleted");
  });
};

//mengganti data mandiri. need operation 'FORM_SELF'
const updateDataKaryawanSelf = (req, res) => {
  // console.log("update profile");
  const setClause = Object.keys(req.body)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");
  const values = [...Object.values(req.body), req.userId];

  //console.log(req.body.dokumen.slice(0,10))
  const sql = `update karyawan set ${setClause} where id = $${
    Object.keys(req.body).length + 1
  }`;

  //console.log(Object.keys(req.body).length + 1)
  pool.query(sql, values, (err, result) => {
    if (err) return res.status(401).send(err);
    // console.log("profile ter update");
    res.status(200).send("profile ter update");
  });
};

//update karyawan menyesuaikan input ex hanya nama yang masuk. need operation 'UPDATE_KARYAWAN
const updateDataKaryawanById = (req, res) => {
  if (check.checkOperation("UPDATE_KARYAWAN", req.userOperation, res)) return;

  console.log(req.body);
  const setClause = Object.keys(req.body)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");
  const values = [...Object.values(req.body), req.params.id];

  const sql = `update karyawan set ${setClause} where id = $${
    Object.keys(req.body).length + 1
  } returning nama`;
  // console.log(sql, values);
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(401).send(err);
    }
    check.saveAudit(
      req.userId,
      `melakukan update karyawan dengan nama ${result.rows[0].nama}`
    );
    return res.status(200).json({ massage: "data updated" });
  });
  // res.send(sql)
};

const getNameAndIdOnly = async (req, res) => {
  const { rows } = await pool.query(
    `select id,nama from karyawan order by nama`
  );
  // console.log(rows);
  return res.status(200).send(rows);
};

const getDataKaryawanGender = (req, res) => {
  if (check.checkOperation("READ_KARYAWAN", req.userOperation, res)) return;

  const gender = ["Laki-laki", "Perempuan",];
  const data = [0, 0,];

  const promises = gender.map((s, index) => {
    return new Promise((resolve, reject) => {
      pool.query(queries.getDataKaryawanGender, [s], (err, result) => {
        if (err) reject(err);
        // console.log(s,result.rowCount)
        data[index] = result.rowCount;
        resolve();
      });
    });
  });

Promise.all(promises)
    .then(() => {
      // console.log(data)
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
};

const getJobLevel = (req, res) => {
  if (check.checkOperation("READ_KARYAWAN", req.userOperation, res)) return;

  const level = ["Head", "Leader","Senior","Staff"];
  const data = [0, 0, 0, 0];

  const promises = level.map((s, index) => {
    return new Promise((resolve, reject) => {
      pool.query(queries.getJobLevel, [s], (err, result) => {
        if (err) reject(err);
        // console.log(s,result.rowCount)
        data[index] = result.rowCount;
        resolve();
      });
    });
  });

Promise.all(promises)
    .then(() => {
      // console.log(data)
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
}

const getLamaKerja = async (req, res) => {
  try {
    const lamaKerja1 = await pool.query(queries.getBerapaLama[0]);
    const lamaKerja2 = await pool.query(queries.getBerapaLama[1]);
    const lamaKerja3 = await pool.query(queries.getBerapaLama[2]);

    const countKategori1 = lamaKerja1.rowCount;
    const countKategori2 = lamaKerja2.rowCount;
    const countKategori3 = lamaKerja3.rowCount;

    const data = [countKategori1, countKategori2, countKategori3];
    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getjumlahkaryawan = async(req,res)=>{
  const Sisa = await pool.query(queries.getjumlahkaryawan,);
  console.log(Sisa.rows);
  console.log(req.userId);
  res.status(200).json(Sisa.rows[0]);
};


module.exports = {
  getNameAndIdOnly,
  getDataKaryawan,
  getKaryawanSelf,
  getDataKaryawanById,
  getDataKaryawanStatus,
  getDataKaryawanGender,
  searchDataKaryawan,
  deleteDataKaryawanById,
  updateDataKaryawanById,
  updateDataKaryawanSelf,
  getJobLevel,
  getLamaKerja,
  getjumlahkaryawan,
};
