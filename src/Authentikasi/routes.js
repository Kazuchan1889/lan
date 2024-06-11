const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");
/// ip:port/api/auth
const router = Router();

router.post("/register", verifyToken, cont.registerUser);
router.post("/login", cont.loginUser);
router.post("/changepass/inside", verifyToken, cont.ubahpassword);
router.post("/changepass/otp", cont.ubahPasswordOtp);
router.post("/check/jawaban", verifyToken, cont.checkjawaban);
router.post("/generateotp", cont.generateOTP);
router.post("/check/otp", cont.checkOTP);
router.get("/check/token", verifyToken, cont.checkAT);
router.get("/operation", verifyToken, cont.getAllOperation);

module.exports = router;
