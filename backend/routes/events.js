const express = require("express");
const router = express.Router();
const PageController = require("../controllers/PageController");

router.get('/Entrepreneurship_Development_Drive', PageController.edd);
router.get('/Eupdates', PageController.eupdates);
router.get('/Ideathon', PageController.ideathon);
router.get('/Plandemic', PageController.plandemic);
router.get('/Startup_Series', PageController.startupseries);
router.get('/Startup_Series_Registration', PageController.startupSeriesRegistration);
router.get('/Pankh', PageController.pankh);
router.get('/team-up', PageController.teamUp);
router.get('/e21', PageController.e21);

module.exports = router;