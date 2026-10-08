require("dotenv").config();

const pool = require("./db");
const express = require("express");
const cors = require("cors");
const propertiesRouter = require("./properties");

const app = express();
const port = 5000;

app.get("/api/health",async(req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
        status: "ok",
        database: "connected"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});

app.use("/api/properties", propertiesRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}!`);
});
