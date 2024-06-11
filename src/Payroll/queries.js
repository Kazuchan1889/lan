const getPayrollFiltered = `select
p.id as id,
k.nama as "nama",
k.jabatan as "jabatan",
k.bankacc as "rekening",
to_char(p.nominal, 'Rp999,999,999,999') as "nominal",
to_char(k.gaji, 'Rp999,999,999,999') as "gaji",
to_char(p.potong, 'Rp999,999,999,999') as "potongan",
trim(to_char(to_date(p.month::text, 'MM'), 'Month')) as "month",
p.year as "year" 
from payroll p join karyawan k on p.idk = k.id
where
(p.month = $1 or $1 is null) 
and (k.nama ilike $2 or k.jabatan ilike $2)
and (p.year = $3 or $3 is null) 
order by 
p.year desc,
p.month desc
`;

const getPayrollself = `select
p.id as id,
k.nama as "nama",
k.jabatan as "jabatan",
k.bankacc as "rekening",
to_char(p.nominal, 'Rp999,999,999,999') as "nominal",
to_char(k.gaji, 'Rp999,999,999,999') as "gaji",
to_char(p.potong, 'Rp999,999,999,999') as "potongan",
trim(to_char(to_date(p.month::text, 'MM'), 'Month')) as "month",
p.year as "year"
From payroll p join karyawan k on p.idk = k.id
where
p.idk = $1 
order by 
p.year desc,
p.month desc
`;

const postPayroll = [
  //0
  `SELECT 
    id, 
    operation, 
    gaji 
    FROM karyawan`,
  //1
  `SELECT 
  id as id, 
  to_char(date,'DD/MM/YYYY') as date, 
  status as status,
  pengajuanid as pid
  FROM 
  absensi
  WHERE 
  idk = $1 
  AND extract(month from date) = $2
  AND (status != 'masuk') 
  ORDER BY date asc`,
  //2
  `SELECT
  COUNT(CASE WHEN ontime IS NULL THEN 1 END) AS ontime_null_count,
  COUNT(CASE WHEN ontime = false THEN 1 END) AS ontime_false_count,
  COUNT(CASE WHEN ontime = true THEN 1 END) AS ontime_true_count,
  to_char(targetdate,'DD/MM/YYYY') as date 
  FROM
  laporan
  WHERE
  idk = $1
  AND EXTRACT(MONTH FROM targetdate) = $2
  GROUP BY
  targetdate
  ORDER BY
  targetdate;
    `,
  //3
  `select id from payroll 
  where idk = $1
  and month = $2
  and year = $3
  and isbonus = false`,
  //4
  `update 
    payroll 
    set 
    potong = $1,
    nominal = $2, 
    rumus = $3,
    detail = $4,
    value = $5,
    input = $6
    where 
    idk = $7
    and month = $8
    and year = $9
    returning *`,
  //5
  `insert into 
    payroll 
    (idk,potong,nominal,rumus,detail,value,input,month,year,isbonus) 
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,false) returning *`,
  //
];

const postBonusPayroll = [
  //0
  `SELECT 
    id, 
    operation, 
    gaji 
    FROM karyawan`,
  //1
  `select
    id
    from payroll
    where idk = $1
    and month = $2
    and year = $3
    and isbonus = true`,
  //2
  `update 
    payroll 
    set 
    potong = $1,
    nominal = $2, 
    rumus = $3,
    detail = $4,
    value = $5,
    input = $6
    where 
    id = $7
    returning *`,
  //3
  `insert into 
    payroll 
    (idk,potong,nominal,rumus,detail,value,input,month,year,isbonus) 
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,true) returning *`,
];

const excelPayroll = `select 
k.nama as "nama",
k.jabatan as "jabatan",
k.bankacc as "rekening",
to_char(p.nominal, 'Rp999,999,999,999') as "nominal",
to_char(k.gaji, 'Rp999,999,999,999') as "gaji",
to_char(p.potong, 'Rp999,999,999,999') as "potongan",
trim(to_char(to_date(p.month::text, 'MM'), 'Month')) as "month"
from payroll p join karyawan k on p.idk = k.id
where
(p.month = $1 or $1 is null)
order by
p.month desc,
p.year desc`;
module.exports = {
  getPayrollFiltered,
  getPayrollself,
  postPayroll,
  postBonusPayroll,
  excelPayroll,
};
