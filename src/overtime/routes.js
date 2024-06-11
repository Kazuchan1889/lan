const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/absensi
const router = Router();

router.use(verifyToken);
//get
router.get("/list",cont.getOverTime);

//post
router.post("/post",cont.postOverTime);

//patch
router.patch("/status/:Id",cont.patchOverTimeStataprove);

module.exports = router;