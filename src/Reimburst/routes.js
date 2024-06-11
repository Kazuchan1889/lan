const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/reimburst
const router = Router();

router.use(verifyToken);

router.post("/get", cont.getReimburst);
router.get("/get/data/self", cont.getReimburstSelf);

router.post("/post", cont.postReimburst);

router.patch("/patch/:id/:status", cont.updateReimburst);

module.exports = router;
