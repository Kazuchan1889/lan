//get
const getPengajuan = [
  //get izin
  `select
    p.id as id,
    k.nama as nama,
    to_char(p.mulai,'DD/MM/YYYY') as mulai, 
    to_char(p.selesai,'DD/MM/YYYY') as selesai,
    p.alasan as alasan, 
    p.dokumen as dokumen, 
    p.status as status 
    from pengajuan p join karyawan k on p.idk = k.id 
    where p.tipe = $1 
    and (k.nama ilike $2 or k.jabatan ilike $2)
    and ((p.mulai <= $3 and p.selesai >= $3) or $3 is null)
    order by p.date desc`,
  //get cuti
  //status head
  `select
    p.id as id,
    k.nama as nama,
    to_char(p.mulai,'DD/MM/YYYY') as mulai,
    to_char(p.selesai,'DD/MM/YYYY') as selesai,
    p.alasan as alasan,
    p.status as status,
    c.status_head as shead,
    c.status_hr as shr,
    c.progress as progress,
    k2.nama as pengganti
    from pengajuan p 
    join karyawan k on p.idk = k.id
    join cuti c on p.detailpengganti = c.id
    join karyawan k2 on k2.id = c.idpengganti
    where 
    p.tipe = $1 
    and (k.nama ilike $2 or k.jabatan ilike $2)
    and ((p.mulai <= $3 and p.selesai >= $3) or $3 is null)
    order by p.date desc`,
];
const getPengajuanDated = `
select 
k.nama as nama, 
to_char(p.mulai,'DD/MM/YYYY') as mulai, 
to_char(p.selesai,'DD/MM/YYYY') as selesai, 
p.alasan as alasan, 
p.dokumen as dokumen, 
p.status as status 
from 
pengajuan p join karyawan k on p.idk = k.id 
where 
p.tipe = $1 
and (k.nama ilike $2 or k.jabatan ilike $2)
and status is null
order by p.date desc`;
const excelPengajuanDated = `SELECT
k.nama AS nama,
TO_CHAR(p.mulai, 'Day, DD Mon YYYY') AS mulai,
TO_CHAR(p.selesai, 'Day, DD Mon YYYY') AS selesai,
p.alasan AS alasan,
p.tipe AS tipe,
CASE
    WHEN p.status IS NULL THEN 'waiting'
    WHEN p.status = true THEN 'accepted'
    WHEN p.status = false THEN 'rejected'
END AS status
FROM
pengajuan p
JOIN
karyawan k ON p.idk = k.id
WHERE
p.tipe = $1
AND ((p.mulai <= $2 and p.selesai >= $2) OR $2 IS NULL)
ORDER BY
p.date DESC
`;
//update
const getPengajuanSelf = [
  `select 
    p.id as id,
    k.nama as nama,
    to_char(p.mulai,'DD/MM/YYYY') as mulai, 
    to_char(p.selesai,'DD/MM/YYYY') as selesai,
    p.alasan as alasan,
    p.dokumen as dokumen,
    p.status as status,
    p.jenis as jenis 
    from pengajuan p 
    join karyawan k on p.idk = k.id 
    where p.tipe = $1 
    and p.idk = $2 
    order by p.date desc`,
  `SELECT 
    p.id as id,
    k.nama as nama, 
    to_char(p.mulai,'DD/MM/YYYY') as mulai, 
    to_char(p.selesai,'DD/MM/YYYY') as selesai,
    p.alasan as alasan, 
    p.dokumen as dokumen, 
    p.status as status , 
    k2.nama as pengganti,
    c.progress as progress
    FROM karyawan k
    JOIN pengajuan p ON k.id = p.idk
    JOIN cuti c ON p.detailpengganti = c.id
    JOIN karyawan k2 ON c.idpengganti = k2.id
    where p.tipe = $1 and p.idk = $2 order by p.date desc`,
];
const updatePengajuanIzin = [
  "select tipe, mulai, selesai, idk from pengajuan where id = $1",
  "update pengajuan set status = $2, suratsakit = $3 where id = $1 returning alasan",
  "SELECT id FROM absensi WHERE idk = $1 AND date = $2",
  "UPDATE absensi SET status = $1,pengajuanid = $2 WHERE id = $3",
  "INSERT INTO absensi (idk, status, date, pengajuanid) VALUES ($1, $2, $3, $4) returning *",
];

const setJatahCuti = "update karyawan set cutiMandiri = $1, cutiBersama = $2";
//post
const postPengajuanIzin =
  "insert into pengajuan (tipe,idk,date,mulai,selesai,alasan,dokumen,jenis)values($1,$2,$3,$4,$5,$6,$7,$8)";
const postPengajuanCuti = [
  "insert into cuti (idpengganti,progress) values($1,'waiting') returning id",
  "insert into pengajuan (tipe,idk,date,mulai,selesai,alasan,detailpengganti)values($1,$2,$3,$4,$5,$6,$7)",
];
const postAbsensiSetToCuti =
  "do $$ declare startDate Date := $1; endDate Date := $2; currDate Date := startDate; begin while currDate <= endDate loop insert into absensi (idk,status,date) values($3,$4,currDate) on conflict (idk,date) do update set status = $4 returning id; currDate := currDate+1; end loop; end$$";

  const getSisaCuti = `select count(*) as Cuti_Terpakai from pengajuan where idk=$1 and date_part('year', date) = date_part('year', CURRENT_DATE) and status = true and tipe = 'izin'; `;

module.exports = {
  getPengajuan,
  getPengajuanSelf,
  getPengajuanDated,
  updatePengajuanIzin,
  postPengajuanCuti,
  postPengajuanIzin,
  setJatahCuti,
  postAbsensiSetToCuti,
  excelPengajuanDated,
  getSisaCuti,
};
