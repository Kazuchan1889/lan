const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/export
const router = Router();

router.use(verifyToken);

router.post("/data/:index", cont.exportData);
router.post("/slipgaji/:file/:index", cont.fileExt);
router.post("/reimburse/detail/pdf", cont.reimburseDetailPdf);

module.exports = router;
