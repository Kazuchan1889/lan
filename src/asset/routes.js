const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/absensi
const router = Router();

router.use(verifyToken);

//get
router.get("/list",cont.getAllAsset);
router.get("/list/:Id",cont.getCertainAsset);

//post
router.post("/post",cont.postAsset);

//patch
router.patch("/list/:Id",cont.patchAssetById);

//delete
router.delete("/list/:Id",cont.deleteAsset);

module.exports = router;