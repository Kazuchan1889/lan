const postAsset =  `insert into asset(nama_barang,merek,model_tipe,harga,jumlah) values($1,$2,$3,$4,$5);`;
const getAsset = `select nama_barang, merek, model_tipe, cast(harga as money), jumlah, cast((harga * jumlah) as money) as hargaTotal from asset;`;
const checkAsset = `select * from asset 
where nama_barang ilike($1) 
and merek ilike($2)
and model_tipe ilike($3)
and harga = $4
;`;
const patchAsset = `
update asset
set nama_barang = $1, 
    merek = $2, 
    model_tipe = $3, 
    harga = $4, 
    jumlah = $5
where id = $6
;`;

module.exports = {
    postAsset,
    getAsset,
    checkAsset,
    patchAsset,
}