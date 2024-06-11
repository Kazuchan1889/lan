const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");

const router = Router();

router.use(verifyToken)

//get
router.get("/get",cont.getBiodata);
router.get("/jumlah",cont.getJumlahkaryawan);

//post
router.post("/post",cont.postBiodata);

//patch
router.patch("/update",cont.updateBiodata);

module.exports = router;