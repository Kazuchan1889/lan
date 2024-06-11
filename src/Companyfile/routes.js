const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
const router = Router();

router.use(verifyToken);

//get
router.get("/list/company",cont.getCompanyFile);
router.get("/list/other",cont.getOtherFile);
router.get("/list/:Id",cont.getFilebyEmployeeId);

//post
router.post("/list/company/upload",cont.uploadCompanyFile);
router.post("/list/other/upload",cont.uploadOtherFile);

//patch
router.patch("/list/company/patch/:Id",cont.patchCompanyFile);

//delete
router.delete("/delete/:Id",cont.deleteFile);

module.exports = router;