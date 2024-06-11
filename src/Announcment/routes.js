const { Router } = require("express");
const cont = require("./cont");
const verifyToken = require("../../verifyToken");

const router = Router();

router.use(verifyToken);

router.get('/get', cont.getAnnounce);

router.post('/post',cont.postAnnounce);

router.patch("/patch",cont.patchAnnounce);

router.delete("/delete/:id",cont.deleteAnnounce);

module.exports = router;
//post bisa ke employee atau branch