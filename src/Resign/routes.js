const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/resign
const router = Router();

router.use(verifyToken);

router.get("/get/data/self", cont.getResignSelf);
router.post("/get", cont.getResign);
router.post("/post", cont.postResign);
router.patch("/patch/:id/:status", cont.updateResign);

module.exports = router;
