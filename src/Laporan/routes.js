const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");

const router = Router();

router.use(verifyToken);

router.get("/get/data/self", cont.getLaporanSelf);
router.post("/get", cont.getLaporan);
router.post("/post", cont.postLaporan);

module.exports = router;
