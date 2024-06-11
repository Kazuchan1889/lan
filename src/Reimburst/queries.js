const postReimburst =
  "insert into reimburst (idk,date,biaya,keterangan,transaksi,dokumen,progres) values ($1,$2,$3,$4,$5,$6,$7)";
const getReimburst = [
  `select 
r.id as id,
k.nama as nama, 
k.jabatan as jabatan, 
r.keterangan as keterangan,
r.biaya as biaya,
to_char(r.date,'DD/MM/YYYY') as tanggal,
to_char(r.transaksi,'DD/MM/YYYY') as date,
r.status as status,
r.dokumen as dokumen,
r.progres as progres
from 
reimburst r join karyawan k on r.idk = k.id 
where 
(progres != 'waiting' and progres != 'accepted')
and (Extract(month from r.transaksi) = $1 or $1 is null)
and (Extract(year from r.transaksi) = $2 or $2 is null)
order by r.date desc`,
  `select 
r.id as id,
k.nama as nama, 
k.jabatan as jabatan, 
r.keterangan as keterangan,
r.biaya as biaya,
to_char(r.date,'DD/MM/YYYY') as tanggal,
to_char(r.transaksi,'DD/MM/YYYY') as date,
r.status as status,
r.dokumen as dokumen,
r.progres as progres
from 
reimburst r join karyawan k on r.idk = k.id 
where 
(progres = 'waiting')
and (Extract(month from r.transaksi) = $1 or $1 is null)
and (Extract(year from r.transaksi) = $2 or $2 is null)
order by r.date desc`,
  `select 
r.id as id,
k.nama as nama, 
k.jabatan as jabatan,
k.bankacc as norek,
k.bankname as bankname,
r.keterangan as keterangan,
r.biaya as biaya,
to_char(r.transaksi,'DD/MM/YYYY') as date,
r.status as status,
r.progres as progres,
Extract(month from r.transaksi) as bulan,
Extract(year from r.transaksi) as tahun
from 
reimburst r join karyawan k on r.idk = k.id 
where 
progres = 'accepted'
and (Extract(month from r.transaksi) = $1 or $1 is null)
and (Extract(year from r.transaksi) = $2 or $2 is null)
order by r.date desc`,
];
const getReimburstSelf = `
select 
k.nama as nama, 
k.jabatan as jabatan, 
r.keterangan as keterangan, 
r.biaya as biaya,
to_char(r.date,'DD/MM/YYYY') as date,
to_char(r.transaksi,'DD/MM/YYYY') as tanggal,
r.status as status, 
r.dokumen as dokumen,
r.progres as progress
from 
reimburst r join karyawan k on r.idk = k.id where k.id = $1 
order by r.date desc`;
const excelReimburst = `
select 
k.nama as nama,
k.jabatan as jabatan,
r.keterangan as keterangan,
r.biaya as biaya,
to_char(r.date,'DD/MM/YYYY') as date,
to_char(r.transaksi,'DD/MM/YYYY') as "tanggal pengajuan",
r.progres as progres
from reimburst r join karyawan k on r.idk = k.id where r.date = $1 or $1 is null 
order by r.date desc`;
module.exports = {
  postReimburst,
  getReimburst,
  getReimburstSelf,
  excelReimburst,
};
