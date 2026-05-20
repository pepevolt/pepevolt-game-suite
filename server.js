const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// serve frontend
app.use(express.static(path.join(__dirname, "public")));

// API: send contracts to frontend
app.get("/config", (req, res) => {
  res.json({
    token: process.env.TOKEN_CONTRACT,
    treasury: process.env.TREASURY_CONTRACT,
    engine: process.env.ENGINE_CONTRACT
  });
});

// root route fix
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// fallback (IMPORTANT for Render)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});