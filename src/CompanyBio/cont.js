const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");

const getBiodata = async(req,res)=>{
    try{
        const Biodata = await pool.query(queries.getBioData);
        return res.status(200).send(Biodata.rows);
    }catch(error){
        res.send(error);
    }
};
const postBiodata = async(req, res)=>{
    try{    
        if(req.userRole!='admin'){
            res.status(403).send('Akses Ditolak');
        }
        const {
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
        }=req.body;

        const Biodata = await pool.query(queries.postBioData,[
            logo,
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
        ]);
        res.status(200).send(Biodata.rows);
    }
    catch(error){
        res.send(error);
    }

};
const updateBiodata = async(req,res)=>{
    try{
        if(req.userRole!='admin'){
            res.status(403).send('Akses Ditolak');
        }
        const {
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
        }=req.body;

        const Biodata = await pool.query(queries.updateBioData,[
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
        ]);
        const getData = await pool.query(queries.getBioData);
        return res.status(200).send(getData.rows);
    }
    catch(error){
        return res.send(error);
    }
};

const getJumlahkaryawan = async(req,res)=>{
    try{
        const jumlahKaryawan = await pool.query(queries.getJumlahKaryawan);
        console.log(jumlahKaryawan.rows[0]);
        res.status(200).send(jumlahKaryawan.rows);
    }
    catch(error){
        res.send(error);
    }
    
}

module.exports = {
    getBiodata,
    postBiodata,
    updateBiodata,
    getJumlahkaryawan,
}