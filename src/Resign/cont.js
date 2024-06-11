const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");
//operasi yang dibutuhkan READ_UPDATE

//post resign form, need operation 'FORM_SELF'
const postResign = (req, res) => {
  console.log(req.body);
  if (check.checkOperation("SELF_FORM", req.userOperation, res)) return;
  const { alasan, tanggal } = req.body;
  const id = req.userId;
  const date = new Date();

  if (!alasan || !tanggal) return res.status(406).send("field tidak lengkap");
  date.setUTCHours(date.getUTCHours() + 7);
  pool.query(queries.postResign, [id, alasan, date, tanggal], (err, result) => {
    if (err) throw err;
    return res.status(200).send("resign berhasil dikirim");
  });
};

//mendapatkan resign, need operation 'READ_RESIGN'
const getResign = (req, res) => {
  //if(check.checkOperation('READ_RESIGN',req.userOperation,res)) return

  const sstring = req.body.search ? req.body.search : "";
  const searchString = "%" + sstring + "%";
  pool.query(queries.getResign, [searchString], (err, result) => {
    if (err) throw err;
    res.status(200).json(result.rows);
  });
};

// mendapatkan resign mandiri, need operation 'FORM_SELF'
const getResignSelf = (req, res) => {
  if (check.checkOperation("SELF_FORM", req.userOperation, res)) return;

  const date = new Date();
  date.setUTCDate(date.getUTCHours() + 7);
  pool.query(queries.getResignSelf, [req.userId], (err, result) => {
    if (err) throw err;
    res.status(200).json(result.rows);
  });
};

const updateResign = (req, res) => {
  if (check.checkOperation("UPDATE_RESIGN", req.userOperation, res)) return;

  const id = req.params.id;
  const status = req.params.status;
  pool.query(
    "update resign set status = $1 where id = $2",
    [status, id],
    (err, result) => {
      if (err) throw err;
      res.status(200).send("update berhasil");
    }
  );
};

module.exports = {
  postResign,
  getResign,
  getResignSelf,
  updateResign,
};
