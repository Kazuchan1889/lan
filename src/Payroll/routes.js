const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/resign
const router = Router();

router.use(verifyToken);
router.get("/get/data/self", cont.getPayrollself);
router.post("/get", cont.getPayrollFiltered);
router.post("/post/bulanan", cont.postPayroll);
router.post("/post/bonus", cont.bonusPayroll);
router.post("/update/tunjangan", cont.updateTunjanganGaji);
router.get("/get/formula", cont.getFormula);
router.post("/add/formula", cont.tambahFormula);
router.post("/update/formula/:index", cont.gantiFormula);
router.delete("/delete/formula/:index", cont.hapusFormula);

module.exports = router;
