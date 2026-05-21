require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Enable Cross-Origin Resource Sharing so your frontend can communicate with this backend
app.use(cors());
app.use(express.json());

// Main API Route used by the frontend to safely pull contract settings
app.get("/api/config", (req, res) => {
    res.json({
        pvlt: process.env.PVLT_CONTRACT,
        treasury: process.env.TREASURY_CONTRACT,
        game: process.env.GAME_CONTRACT
    });
});

// Base Route to check status
app.get("/", (req, res) => {
    res.send("PVLT SERVER RUNNING - API READY AT /api/config");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SERVER STARTED ON PORT ${PORT}`);
});
