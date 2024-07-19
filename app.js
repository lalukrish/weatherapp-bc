const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const weatherRoutes = require("./routes/weatherRouter.js");

app.use(cors());
app.use(bodyParser.json());
//mongodb
mongoose
  .connect(
    "mongodb+srv://lalkirshna00:lalkrishna00@cluster0.1m34c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api", weatherRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
