const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/karyawan

const router = Router();

router.use(verifyToken);
//get
router.get("/get", cont.getDataKaryawan);
router.get("/get/data/self", cont.getKaryawanSelf);
router.get("/get/:id", cont.getDataKaryawanById);
router.post("/get/data/search", cont.searchDataKaryawan);
router.get("/get/data/status", cont.getDataKaryawanStatus);
router.get("/get/data/gender", cont.getDataKaryawanGender);
router.get("/nama&id", cont.getNameAndIdOnly);
router.get("/get/data/level", cont.getJobLevel);
router.get("/lamakerja",cont.getLamaKerja);
//delete
router.delete("/del/:id", cont.deleteDataKaryawanById);
//patch update
router.patch("/patch/:id", cont.updateDataKaryawanById);
router.patch("/patch/data/self", cont.updateDataKaryawanSelf);

module.exports = router;
