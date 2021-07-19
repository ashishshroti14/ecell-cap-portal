const express = require("express");
const router = express.Router();
const {
    login,
    logout,
    getTasksAdmin,
    getAmbassadorsAdmin,
    getAvenuesAdmin,
    updatePoints,

} = require("../controllers/CAPAdminController");

router.post("/login", login);
router.get("/admin/logout", logout);

router.get("/admin/tasks", getTasksAdmin)
router.get("/admin/task/ambassadors", getAmbassadorsAdmin)
router.get("/admin/task/ambassador/submissions", getAvenuesAdmin)
router.post("/admin/task/ambassador/submissions/update-points", updatePoints)
router.get("/admin/all-ambassadors", getAmbassadorsAdmin)


module.exports = router;
