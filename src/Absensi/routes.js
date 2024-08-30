
const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/absensi
const router = Router();

router.use(verifyToken);
//Dashboard
router.get("/get/data/status", cont.getAbsensiStatusToday);
router.get("/get/status/month", cont.getAbsensiMonthlyID);
router.get("/get/today/self", cont.checkAbsensiTodaySelf);
router.patch("/patch/:condition", cont.patchInOutByID);
router.patch("/update/status", cont.patchStatusById);

//Table page
router.get("/get", cont.getAbsensi);
router.post("/get/data/dated", cont.getAbsensiDated);

//Seting Absensi
router.get("/get/holiday", cont.getAbsensiHoliday);
router.get("/get/time", cont.getAbsensiTime);
router.post("/update/seting", cont.updateAbsensiSetting);
router.post("/post/holiday", cont.absensiHoliday);
router.post("/post/today", cont.postAbsensiToday);

module.exports = router;
