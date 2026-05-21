require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Simulated persistent state record tracker database mapping instance
const userProgressDatabase = {};

// API Route used by the frontend to safely pull contract settings
app.get("/api/config", (req, res) => {
    res.json({
        pvlt: process.env.PVLT_CONTRACT,
        treasury: process.env.TREASURY_CONTRACT,
        game: process.env.GAME_CONTRACT
    });
});

// Endpoint to retrieve verified game statistics for a specific user
app.get("/api/user-stats", (req, res) => {
    const { address } = req.query;
    if (!address) {
        return res.status(400).json({ error: "Required address identification string missing parameter mapping." });
    }

    const standardMappingKey = address.toLowerCase();
    
    // Allocate initialization default entries for first-time profile requests
    if (!userProgressDatabase[standardMappingKey]) {
        userProgressDatabase[standardMappingKey] = {
            energy: 1000,
            gPVLT: 0.0
        };
    }

    res.json(userProgressDatabase[standardMappingKey]);
});

// Secure endpoint processing back-to-back click progress synchronizations
app.post("/api/sync-progress", (req, res) => {
    const { walletAddress, currentGPVLT, currentEnergy } = req.body;
    
    if (!walletAddress) {
        return res.status(400).json({ error: "Invalid synchronization payload array: wallet location expected." });
    }

    const standardMappingKey = walletAddress.toLowerCase();

    // Persist local browser context update actions directly into the storage allocation grid
    userProgressDatabase[standardMappingKey] = {
        energy: parseInt(currentEnergy) || 0,
        gPVLT: parseFloat(currentGPVLT) || 0.0
    };

    res.json({ success: true, timestamp: Date.now() });
});

// Base Route to check status
app.get("/", (req, res) => {
    res.send("PVLT HYBRID SERVER RUNNING - CLICKS PERSISTENCE INTERFACES DEPLOYED OPERATIONAL");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SERVER STARTED ON PORT ${PORT}`);
});
