require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

// route import
const routes = require("./routes/index");

const app = express();

const port = process.env.PORT;

app.use(express.json());

// routes:
app.use("/api/v1/", routes);
app.get("/", (req, res) => {
  res.contentType("application/json");
  res.json(
    {
      success: true,
      message: "Ok Running",
    },
    200,
  );
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`now server running in port ${port}`);
  });
});
