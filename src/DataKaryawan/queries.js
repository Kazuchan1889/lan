//karyawan
const getDataKaryawan =
  "select id,nama,jabatan,status from karyawan order by nama";
const   getDataKaryawanById = "select * from karyawan where id = $1";
const getDataKaryawanStatus = "select id from karyawan where status = $1";
const getDataKaryawanGender = "select id from karyawan where gender = $1";
const getJobLevel = " select level from karyawan where level = $1 ";
const searchDataKaryawan = `
    select 
    id,
    nikid,
    nama,
    email,
    to_char(dob,'DD/MM/YYYY') as dob,
    notelp,
    alamat,
    gender,
    religion,
    jabatan,
    status,
    divisi,
    level,
    nik,
    npwp,
    maritalstatus,
    bankacc,
    bankname,
    operation,
    dokumen,
    to_char(tglmasuk,'DD/MM/YYYY') as tglmasuk,
    to_char(tglkeluar,'DD/MM/YYYY') as tglkeluar,
    lokasikerja,
    gaji
    from karyawan
    where 
    nama ilike $1 
    or jabatan ilike $1 
    or status ilike $1
    order by nama`;
const deleteDataKaryawanById =
  "delete from karyawan where id = $1 returning nama";

const updateDataKaryawanById = "update karyawan set ? where id = ?";
const excelDataKaryawan = `SELECT 
    nikid AS "No Induk Karyawan",
    nama,
    email,
    to_char(dob,'DD/MM/YYYY') AS "Tanggal Lahir",
    notelp,
    alamat,
    gender,
    religion AS "Agama",
    jabatan,
    status,
    divisi,
    level,
    nik,
    npwp,
    maritalstatus AS "Marital Status",
    bankacc AS "Bank Account",
    bankname AS "Bank Name",
    to_char(tglmasuk,'DD/MM/YYYY') AS "Tanggal Masuk",
    to_char(tglkeluar,'DD/MM/YYYY') AS "Tanggal Keluar",
    lokasikerja AS "Lokasi Kerja",
    gaji
    FROM 
    karyawan 
    ORDER BY 
    nama;
    `;

    const getBerapaLama = [
      `select id from karyawan where tglmasuk>current_date-interval '1' year and tglkeluar is null;`,
      `select id from karyawan where tglmasuk<=current_date-interval '1' year and
      tglmasuk>=current_date - interval '2' year and tglkeluar is null;`,
      `select id from karyawan where tglmasuk<=current_date-interval '2' year and tglkeluar is null;`
      
      ];
      
module.exports = {
  getDataKaryawan,
  getDataKaryawanById,
  getDataKaryawanStatus,
  getDataKaryawanGender,
  searchDataKaryawan,
  deleteDataKaryawanById,
  updateDataKaryawanById,
  excelDataKaryawan,
  getJobLevel,
  getBerapaLama
};
// const addDataKaryawan = 'insert into karyawan (nama,email) values ($1,$2)'
