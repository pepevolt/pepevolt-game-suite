const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// serve frontend
app.use(express.static(path.join(__dirname, "public")));

// contract config API
app.get("/config", (req, res) => {
  res.json({
    token: process.env.TOKEN_CONTRACT,
    treasury: process.env.TREASURY_CONTRACT,
    engine: process.env.ENGINE_CONTRACT,
    reown: process.env.REOWN_PROJECT_ID
  });
});

// root route fix
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// fallback fix for SPA / Render
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("PEPEVOLT running on port " + PORT);
});