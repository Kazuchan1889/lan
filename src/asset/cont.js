const queries = require("./queries");
const pool = require("../../db");

const postAsset = async(req,res)=>{
    const {
        nama_barang,
        merek,
        model_tipe,
        harga,
        jumlah
    } = req.body;
    try{
        const checking = await pool.query(queries.checkAsset,[nama_barang,merek,model_tipe,harga]);
        if(checking.rowCount>0){
            console.log(checking.rows);
            await pool.query(`update asset set jumlah = (jumlah + ${jumlah}) where id = ${checking.rows[0].id}`);
            const getAssetUpdated = await pool.query(queries.getAsset);
            return res.status(200).send(getAssetUpdated.rows);
    
    
        }else{
            await pool.query(queries.postAsset,[nama_barang,merek,model_tipe,harga,jumlah]);
            const getAssetUpdated = await pool.query(queries.getAsset);
            return res.status(200).send(getAssetUpdated.rows);
        }
    }catch(error){
        res.send(error);
    }
    
};
const getAllAsset = async(req,res)=>{
    const getAssetUpdated = await pool.query(queries.getAsset);
    const hargaTotal = await pool.query(`select cast(sum(harga*jumlah) as money) as total from asset;`);
    return res.status(200).send({"asset":getAssetUpdated.rows,"total_harga":hargaTotal.rows[0].total});
};

const getCertainAsset = async (req,res)=>{
    
    try{
        const getAssetById = await pool.query(`select * from asset where id = ${req.params.Id}`);
        return res.status(200).send(getAssetById.rows[0]);
    }catch(error){
        return res.send(error);
    }

}

const patchAssetById = async(req,res)=>{
    const {
        nama_barang,
        merek,
        model_tipe,
        harga,
        jumlah
    } = req.body;
    try{
        await pool.query(queries.patchAsset,[
            nama_barang,
            merek,
            model_tipe,
            harga,
            jumlah,
            req.params.Id
        ]);
        return res.status(200).send("Updated");

    }catch(error){
        return res.send(error);
    }
};

//pernah ga siluh pernahh

const deleteAsset = async(req,res)=>{
    try{
        await pool.query(`delete from asset where id = ${req.params.Id}`);
        return res.status(200).send("Asset Deleted");
    }catch(error){
        res.send(error);
    }
};

module.exports = {
    postAsset,
    getAllAsset,
    getCertainAsset,
    patchAssetById,
    deleteAsset,

}