const insertScheduleCal = `insert into schedule_cal(tipe,tanggal_mulai,tanggal_selesai,judul,deskripsi,mulai,selesai) values ($1, $2,$3,$4,$5,$6,$7);`;
const getSchedulecal = `select judul, deskripsi, to_char(tanggal_mulai,'YYYY-MM-DD') as tanggal_mulai, 
to_char(tanggal_selesai,'YYYY-MM-DD') as tanggal_selesai, 
case tipe 
when true then 'Dibuat admin'
when false then 'Dari google'
end as tipe

from schedule_cal;`;
// const postSchedule = `insert into schedule_cal;`;
const patchApprove = `update schedule_cal 
set tanggal_mulai = $1, tanggal_selesai = $2, mulai = $3, selesai = $4,judul = $5,deskripsi = $6
where id=$7;`;

const postAssign = `insert into scheduler(karyawan_id,schedule_id) values ($1,$2);`;
const getSpecificCal = `select distinct * from schedule_cal where tanggal_mulai=$1 and tanggal_selesai=$2 and judul=$3 and deskripsi=$4;`;
const getKaryawanSchedule = [
`select sc.karyawan_id, ka.nama, sc.schedule_id, scal.tanggal_mulai,scal.tanggal_selesai, scal.judul, scal.deskripsi, scal.mulai,scal.selesai from scheduler sc 
join karyawan ka
on ka.id = sc.karyawan_id
join schedule_cal scal on scal.id = sc.schedule_id;`,
`select sc.karyawan_id, ka.nama, sc.schedule_id, scal.tanggal_mulai,scal.tanggal_selesai, scal.judul, scal.deskripsi, scal.mulai,scal.selesai from scheduler sc 
join karyawan ka
on ka.id = sc.karyawan_id
join schedule_cal scal on scal.id = sc.schedule_id
where sc.schedule_id=$1;`,
`select sc.karyawan_id, ka.nama, sc.schedule_id, scal.tanggal_mulai,scal.tanggal_selesai, scal.judul, scal.deskripsi, scal.mulai,scal.selesai from scheduler sc 
join karyawan ka
on ka.id = sc.karyawan_id
join schedule_cal scal on scal.id = sc.schedule_id
where sc.karyawan_id=$1;`];

const getAssignedScheduler = `select karyawan_id, schedule_id from scheduler 
where karyawan_id = $1 and schedule_id = $2;`;


module.exports = {
    insertScheduleCal,
    getSchedulecal,
    patchApprove,
    postAssign,
    getSpecificCal,
    getKaryawanSchedule,
    getAssignedScheduler,
}