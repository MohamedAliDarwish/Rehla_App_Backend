
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const routes = require("./routes/index");

const app = express();

app.use(express.json());

app.use("/api/v1/", routes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ok Running",
  });
});

// Export Express app
module.exports = app;
