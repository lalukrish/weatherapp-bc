const Weather = require("../models/weatherSchema");
require("dotenv").config();
const axios = require("axios");

const weatherController = {
  getWeatherData: async (req, res) => {
    try {
      const { location } = req.query;

      if (location) {
        const locationUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${process.env.weatherApiKey}`;
        const locationResponse = await axios.get(locationUrl);
        if (locationResponse.data.length === 0) {
          return res.status(404).json({ message: "Location not found" });
        }

        const { lat, lon } = locationResponse.data[0];

        const weatherUrl = `${process.env.weatherBaseUrl}?lat=${lat}&lon=${lon}&appid=${process.env.weatherApiKey}`;

        const weatherResponse = await axios.get(weatherUrl);
        const weatherData = weatherResponse.data;
        if (!weatherData) {
          return res.status(404).json({ message: "No data found" });
        }
        const weather = new Weather({
          name: location,
          main: {
            temp: weatherData.main.temp,
            feels_like: weatherData.main.feels_like,
            temp_min: weatherData.main.temp_min,
            temp_max: weatherData.main.temp_max,
            pressure: weatherData.main.pressure,
            humidity: weatherData.main.humidity,
          },
          visibility: weatherData.visibility,
          wind: {
            speed: weatherData.wind.speed,
            gust: weatherData.wind.gust,
          },
          clouds: {
            all: weatherData.clouds.all,
          },
          sys: {
            sunrise: weatherData.sys.sunrise,
            sunset: weatherData.sys.sunset,
          },
          timestamp: new Date(),
        });

        await weather.save();
        res.status(200).json(weatherData);
      } else {
        const weatherData = await Weather.find();
        res.status(200).json(weatherData);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getHistoricalWeatherData: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (
        (!startDate || startDate.trim() === "") &&
        (!endDate || endDate.trim() === "")
      ) {
        const weatherData = await Weather.find();
        if (weatherData.length === 0) {
          return res.status(404).json({ message: "No historical data found" });
        }
        return res.status(200).json(weatherData);
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const weatherData = await Weather.find({
          createdAt: {
            $gte: start,
            $lte: end,
          },
        });

        if (weatherData.length === 0) {
          return res.status(404).json({
            message: "No historical data found for the given date range",
          });
        }

        return res.status(200).json(weatherData);
      }

      return res.status(400).json({
        message: "Both startDate and endDate are required for filtering",
      });
    } catch (error) {
      console.error("Error fetching historical weather data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = weatherController;
