const express = require("express");
const weatherController = require("../controllers/weatherControllers");
const router = express.Router();

router.get("/weather", weatherController.getWeatherData);
router.get("/weather-history", weatherController.getHistoricalWeatherData);

module.exports = router;
