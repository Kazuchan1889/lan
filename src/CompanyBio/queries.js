const getBioData = `select * from biodata;`;
const postBioData = `insert into biodata(
    logo,
    company_name,
    company_pnumber,
    email,
    address,
    province,
    city,
    industry,
    company_size, 
    npwp_lama,
    npwp_baru,
    company_taxable_date,
    taxperson_npwp,
    taxperson_npwp_16_digit,       
    hq_initial,
    hq_code,
    show_branch_name,   
    umr,
    umr_province,
    umr_city,
    bpjs_ketenagakerjaan,
    jkk
values($1,$2,$3,$4,$5,$6,$7,$8,$9);`;
const updateBioData = `update biodata
    set logo = $1,
    company_name = $2,
    company_pnumber = $3,
    email = $4,
    address = $5,
    province = $6,
    city = $7,
    industry = $8,
    company_size = $9,
    npwp_lama = $10,
    npwp_baru= $11,
    company_taxable_date= $12,
    taxperson_npwp= $13,
    taxperson_npwp_16_digit= $14,       
    hq_initial= $15,
    hq_code= $16,
    show_branch_name = $17,
    umr = $18,
    umr_province= $19,
    umr_city = $20,
    bpjs_ketenagakerjaan = $21,
    jkk = $22
    where id = 2;`;

const getJumlahKaryawan =  `select count(*) as jumlah_karyawan from karyawan where tglkeluar is null;`;

module.exports = {
    getBioData,
    postBioData,
    updateBioData,
    getJumlahKaryawan,
}