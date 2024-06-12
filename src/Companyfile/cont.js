const queries = require("./queries");
const pool = require("../../db");
const check = require("../../public");

/*
Requirement
1. Setiap karyawan bisa upload file ke company files atau other files
2. Akses terhadap delete dan upload masih belum ditentukan, Jadi untuk sekarang tidak ada role khusus untuk
upload dll
3. Pada company files, berisi file yang diupload oleh users dan berisi publish date. Sedangkan di other files
berisi upload date
4. bisa search file
5. bisa search by employee id untuk menunjukkan upload

Requirement untuk nanti
1. dapat memberikan notifikasi lewat email
*/

//mencari json object yang sama untuk return id yang sama dari 2 object
function findSameNumbers(obj1, obj2) {
    const list1 = Array.isArray(obj1.lists) ? obj1.lists : [];
    const list2 = Array.isArray(obj2.lists) ? obj2.lists : [];
    const sameNumbers = list1.filter(number => list2.includes(number));
    return sameNumbers.length === list1.length && sameNumbers.length === list2.length ? sameNumbers : true;
}

const getCompanyFile = async (req, res) => {
    try {
        const result = await pool.query(queries.getKaryawanFile[0]);
        return res.status(200).send(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getFilebyEmployeeId = async (req, res) => {
    if (check.checkOperation("READ_KARYAWAN", req.userOperation, res)) return;

    try {
        const result = await pool.query(queries.getKaryawanFile[1], [req.params.Id]);
        return res.status(200).send(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getOtherFile = async (req, res) => {
    if (check.checkOperation("READ_KARYAWAN", req.userOperation, res)) return;

    try {
        const result = await pool.query(queries.getKaryawanFile[2]);
        return res.status(200).send(result.rows);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const uploadCompanyFile = async (req, res) => {
    if (check.checkOperation("ADD_KARYAWAN", req.userOperation, res)) return;

    const {
        nama_file,
        karyawan_file,
        tanggal_publish,
        access_list = []
    } = req.body;

    if (!karyawan_file) {
        return res.status(400).send("karyawan_file is required");
    }

    try {
        const acc_list = { lists: access_list };
        const getIdlist = await pool.query(`SELECT json_agg(id) AS lists FROM karyawan;`);
        
        if (!findSameNumbers(acc_list, getIdlist.rows[0])) {
            return res.status(400).send("karyawan tidak ditemukan");
        }

        // Ensure access_list is passed as a proper array to PostgreSQL
        await pool.query(queries.uploadingfile[0], [req.userId, nama_file, karyawan_file, tanggal_publish, access_list]);
        return res.status(200).send("Success");
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



const uploadOtherFile = async (req, res) => {
    if (check.checkOperation("ADD_KARYAWAN", req.userOperation, res)) return;

    const {
        karyawan_file
    } = req.body;

    try {
        await pool.query(queries.uploadingfile[1], [req.userId, karyawan_file]);
        return res.status(200).send("Success");
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const patchCompanyFile = async (req, res) => {
    if (check.checkOperation("UPDATE_KARYAWAN", req.userOperation, res)) return;

    const {
        nama_file,
        karyawan_file,
        tanggal_publish,
        access_list = []
    } = req.body;

    try {
        const acc_list = { lists: access_list };
        const getIdlist = await pool.query(`SELECT json_agg(id) AS lists FROM karyawan;`);
        console.log(findSameNumbers(acc_list, getIdlist.rows[0]));

        if (findSameNumbers(acc_list, getIdlist.rows[0]) === false) {
            return res.status(400).send("karyawan tidak ditemukan");
        }

        await pool.query(queries.patchFile[0], [nama_file, karyawan_file, tanggal_publish, access_list, req.params.Id]);
        return res.status(200).send("Success");
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteFile = async (req, res) => {
    if (check.checkOperation("UPDATE_KARYAWAN", req.userOperation, res)) return;

    try {
        // belum menentukan apakah hanya admin yang bisa delete atau user juga bisa upload file sendiri
        await pool.query(queries.deleteKaryawanFile, [req.params.Id]);
        return res.status(200).send("Success");
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCompanyFile,
    getFilebyEmployeeId,
    getOtherFile,
    uploadCompanyFile,
    uploadOtherFile,
    patchCompanyFile,
    findSameNumbers,
    deleteFile,
};
