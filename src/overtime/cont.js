const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");

const postOverTime = async (req, res) => {
    const {
        note,
        mulai,
        selesai,
        tanggal_overtime,
        //boolean
        tipe,
        breaktime,
    } = req.body;
    try {
        // console.log("API is running");
        const post = await pool.query(queries.postOvertime, [note, req.userId, mulai, selesai, tanggal_overtime, tipe, breaktime]);
        return res.status(200).send("success");

    } catch (error) {
        return res.send(error);
    }
};

const getOverTime = async (req, res) => {
    const getOT = await pool.query(queries.getOvertime);
    return res.status(200).send(getOT.rows);
}

const patchOverTimeStataprove = async(req, res)=>{
    if (check.checkOperation("UPDATE_CUTI", req.userOperation, res)) return;
    const statusId = req.params.Id;
    console.log(statusId);

    //bool body request
    const {
        status
    }=req.body
    
    try{
        const findPost = await pool.query(`select * from overtime where id=${statusId}`);
        console.log(findPost)
        if(findPost.rowCount < 1 ){
            console.log('tidak ditemukan')
            return res.status(204).send("post tidak ditemukan");
        } 
            await pool.query(queries.patchApprove,[status,statusId]);
            return res.status(200).send("Success");
       
    }catch(error){
        return res.send(error);
    }

}

module.exports = {
    postOverTime,
    getOverTime,
    patchOverTimeStataprove,
}