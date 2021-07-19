const express = require("express");
const router = express.Router();
const DataController = require("../controllers/DataController");
const S3UploadController = require("../controllers/S3UploadController");

// Common Routes
router.post("/contactform", DataController.contactForm);
router.post("/getContactMessages", DataController.getContactMessageInfo);
router.post("/submit-startup-series-reg-form", S3UploadController.submitStartupSeriesRegForm);
router.post("/cap-form", DataController.capForm);

// Team Up Portal Routes
const teamUpPortal = require("./teamUpPortal");
router.use("/team-up-portal", teamUpPortal);

// E21 Portal Routes
const e21Portal = require("./e21Portal");
router.use("/e21-portal", e21Portal);

// CAP Portal Routes
const capPortal = require("./capPortal");
router.use("/cap-portal", capPortal);

// CAP Admin Routes
const capAdmin = require("./capAdmin");
router.use("/cap-admin", capAdmin);

// Download E-Insider
router.get("/download-insider-mag", (req, res) => {
    res.download("./assets/e-insider-2021.pdf", "E-Insider'21 - Double Page.pdf")
});

module.exports = router;
