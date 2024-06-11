const postResign =
  "insert into resign (idk,alasan,date,tanggal_keluar) values ($1,$2,$3,$4)";
const getResign = `
select 
k.nama as nama, 
k.divisi as divisi, 
k.jabatan as jabatan, 
to_char(date,'DD/MM/YYYY') as tanggalmengajukan,
to_char(tanggal_keluar,'DD/MM/YYYY') as tanggalkeluar,
r.alasan as alasan 
from 
resign r join karyawan k on r.idk = k.id 
where 
k.nama ilike $1 
or k.jabatan ilike $1 
or k.divisi ilike $1`;
const getResignSelf = `select
to_char(date,'DD/MM/YYYY') as tanggalmengajukan,
to_char(tanggal_keluar,'DD/MM/YYYY') as tanggalkeluar,
alasan
from 
resign 
where idk = $1`;
const excelResign = `
select 
k.nama as nama, 
k.divisi as divisi, 
k.jabatan as jabatan, 
to_char(date,'DD/MM/YYYY') as tanggalmengajukan,
to_char(tanggal_keluar,'DD/MM/YYYY') as tanggalkeluar,
r.alasan as alasan 
from 
resign r join karyawan k on r.idk = k.id `;
module.exports = {
  postResign,
  getResign,
  getResignSelf,
  excelResign,
};
