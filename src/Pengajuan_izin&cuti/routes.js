const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/pengajuan

const router = Router();

router.use(verifyToken);

//get
router.get("/get/:tipe/self", cont.getPengajuanSelf);
router.get("/pengganti", cont.getNameAndId);
router.get("/status/get/self", cont.countPengajuan);
router.get("/status/waiting", cont.countAllWaiting);
 router.get("/get/sisa", cont.sisaJatah);

//patch
router.patch("/patch/izin/:id/:status", cont.updatePengajuanIzin);
router.patch("/patch/cuti/:id/:status", cont.updatePengajuanCuti);
router.patch("/patch/jatahCuti", cont.setJatahCuti);

//post
router.post("/get/:tipe", cont.getPengajuan);
router.post("/post/data/serach", cont.getPengajuanDated);
router.post("/post/:tipe", cont.postPengajuan);
router.post("/post/cuti/bersama", cont.setCutiBersama);
router.post("/post/sisa",cont.sisaJatah);

module.exports = router;
