const register = [
  "select * from karyawan where email = $1",
  `insert into karyawan 
  (nama,email,password,jabatan,role,status,operation,dob,nik,npwp,gender,level,lokasikerja,gaji,tglmasuk,divisi,notelp) 
  values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now(),$15,$16) returning nama`,
];
const login = [
  "select * from karyawan where (email = $1 or username = $1 or nama = $1) and status != 'resign'",
  `select
  (case when masuk is not null and keluar is null then 1 end) as udahMasuk,
	(case when masuk is not null and keluar is not null then 1 end) as udahKeluar,
	status
  from absensi where idk = $1 and date = $2`,
];

module.exports = {
  register,
  login,
};
