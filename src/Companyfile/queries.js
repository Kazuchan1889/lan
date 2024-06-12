const getKaryawanFile = [
    `select ls.id, ls.uploader_id, karyawan.nama, nama_file, karyawan_file,
    ls.tanggal_publish, access_list from filelist ls 
	inner join karyawan on ls.uploader_id = karyawan.id
    where ls.tipe = true;`
    ,
    `select ls.id, ls.uploader_id, karyawan.nama, nama_file, karyawan_file, 
    date_trunc('seconds',ls.tanggal_upload) as "tanggal_upload" from filelist ls 
	inner join karyawan on ls.uploader_id = karyawan.id
	where ls.uploader_id = $1 and ls.tipe = true;`
    ,
    `select ls.id, karyawan.nama,ls.uploader_id,nama_file, karyawan_file,
    ls.tanggal_upload::timestamp::date as "tanggal_upload" from filelist ls 
	inner join karyawan on ls.uploader_id = karyawan.id
	;`
];

const uploadingfile = [
    // company file upload
    `
    insert into 
        filelist(uploader_id, nama_file, karyawan_file, tanggal_publish, tanggal_upload, access_list, tipe)
    values
        ($1, $2, $3, $4, now(), $5::int[], true)
    ;`,
    // other file upload
    `
    insert into 
        filelist(uploader_id, karyawan_file, tanggal_upload, tipe)
    values
        ($1, $2, now(), false)
    ;`
];


const patchFile = [
    //digunakan untuk company file
    `
    update filelist
    set nama_file = $1, karyawan_file = $2, tanggal_publish = $3, access_list = $4
    where id = $5 and tipe = true
    ;`,
    //sedang tidak digunakan
    `
    update filelist
    set nama_file = $1, karyawan_file = $2, tanggal_publish = $4, access_list = $5
    where id = $6 and tipe = false
    ;`
];
const deleteKaryawanFile = `
    delete from filelist
    where id = $1;
`;

module.exports = {
    getKaryawanFile,
    uploadingfile,
    patchFile,
    deleteKaryawanFile,
}