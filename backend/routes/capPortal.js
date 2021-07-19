const express = require("express");
const router = express.Router();
const {
    register,
    login,
    logout,
    getUsers,
    verifyAndSendMail,
    sendPasswordResetMail,
    resetPasswordFromCode,
    getTask,
    updateTask,
    getS3SignedPolicy,
    updateAvatar,
    getAvatar,
    changePassword,
    
} = require("../controllers/CAPPortalController");

router.post("/verify-mail", verifyAndSendMail);
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/password-reset-mail", sendPasswordResetMail);
router.put("/reset-password", resetPasswordFromCode);

router.get("/task", getTask);
router.put("/update-task", updateTask);
router.get("/s3-signed-policy/:bucketName", getS3SignedPolicy);
router.put("/ambassador/update-avatar", updateAvatar);
router.get("/avatar", getAvatar);
router.put("/change-password", changePassword);



router.get("/users", getUsers);

module.exports = router;
