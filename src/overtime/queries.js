const postOvertime = `insert into overtime(note,karyawan_id,mulai,selesai,
    tanggal_request, tanggal_overtime,tipe, break) 
    values($1,$2,$3,$4,current_date,$5,$6,make_interval(mins => $7));`
const getOvertime = `select ov.id, karyawan_id,karyawan.nama,note,mulai,selesai,selesai-mulai as waktu,tanggal_overtime,ov.status, 
case ov.tipe 
when true then 'sebelum shift'
when false then 'setelah shift' end as tipe,break
from overtime as ov inner join karyawan 
on karyawan_id = karyawan.id;
`
const patchApprove = `update overtime set status = $1 where id=$2;`;

//

module.exports = {
postOvertime,
getOvertime,
patchApprove,

}