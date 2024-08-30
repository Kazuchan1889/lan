const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/absensi
const router = Router();


router.use(verifyToken);

//get
router.get("/calendar",cont.getGoogleCalendar);
router.get("/assigned",cont.getSchedulerAssigned);
router.get("/scheduler/assigned/:Id",cont.getSchedulerById);
router.get("/scheduler/assigned/karyawan/:Id",cont.getSchedulerByKaryawanId);

//post
router.post("/scheduler/post",cont.postScheduler);

//patch
router.patch("/scheduler/patch/:Id",cont.patchSchedule);

//delete
router.delete("/scheduler/assigned/delete/:Id",cont.deleteAssignedPerson);
router.delete("/scheduler/delete/:Id",cont.deleteScheduler);

module.exports = router;