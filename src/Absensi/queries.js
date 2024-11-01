//absensi
const getAbsensi = "select * from absensi";
const getAbsensiDated = `
  select
  ab.id as id,
  ab.fotomasuk as fotomasuk,
  kn.nama as nama,
  kn.dokumen as photo,
  TO_CHAR(ab.masuk::time, 'HH24:MI') as masuk,
  TO_CHAR(ab.keluar::time, 'HH24:MI') as keluar,
  ab.status as status,
  to_char(ab.date,'DD/MM/YYYY') as date
  from absensi ab 
  join karyawan kn on ab.idk = kn.id 
  where ab.date = $1 and kn.nama ilike $2 
  order by 
  ab.date desc,
  kn.nama asc
  `;
const getAbsensiStatusToday = `
  select 
  id,
  pengajuanid as pid 
  from absensi 
  where 
  date = $1 
  and status = $2`;
const getAbsensiMonthlyID = `
  select 
  id,
  pengajuanid as pid 
  from absensi
  where 
  idk = $1 
  and extract(month from date) = $2 
  and status = $3`;

const checkAbsensiTodaySelf = `select 
    status,
    to_char(masuk::time,'HH24:MI') as masuk,
    to_char(keluar::time,'HH24:MI') as keluar,
    to_char(now()::time,'HH24:MI:SS') as currtime,
    fotomasuk,
    fotokeluar
    from absensi
    where idk = $1
    and date = $2
    `;

const patchAbsensiByID = [
  "update absensi set masuk = now(), status = $1, fotomasuk = $2 where idk = $3 and date = $4 returning *",
  "update absensi set keluar = now(), fotokeluar =$1 where idk = $2 and date = $3 returning *",
];

const postAbsensiToday = [
  `select 
    id 
    from karyawan 
    where 
    status !='resign'`,
  `insert into absensi 
    (idk,status,date) 
    values
    ($1,$2,$3)`,
  `
    select 
    * 
    from pengajuan 
    where 
    mulai <= $1 
    and selesai >= $1 
    and idk = $2 
    and status = true`,
  `update 
    absensi 
    set 
    status = $1 
    where 
    idk = $2 
    and date = $3`,
];

const excelAbsensi = `
select
kn.nama as Nama,
TO_CHAR(ab.masuk::time, 'HH24:MI') as Masuk,
TO_CHAR(ab.keluar::time, 'HH24:MI') as Keluar,
ab.status as Status,
TO_CHAR(ab.date, 'DD/MM/YYYY') as Tanggal
from 
absensi ab join karyawan kn on ab.idk = kn.id
where (ab.date = $1 or $1 is null) 
order by date desc`;

const patchStatus = `update absensi
set
status = $1
where
id = $2
returning *`;

module.exports = {
  checkAbsensiTodaySelf,
  getAbsensiDated,
  getAbsensiStatusToday,
  getAbsensi,
  getAbsensiMonthlyID,
  patchAbsensiByID,
  postAbsensiToday,
  excelAbsensi,
  patchStatus,
};