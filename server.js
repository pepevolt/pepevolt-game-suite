require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json());

// Connect to Polygon
const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com/');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Example endpoint to handle a game action securely
app.post('/process-action', async (req, res) => {
    try {
        const { actionData } = req.body;
        // In a real scenario, verify user signature here to prevent fraud
        
        console.log("Processing action:", actionData);
        // Execute blockchain transaction using the server's wallet
        // const tx = await contract.someFunction(...);
        
        res.json({ success: true, message: "Action processed on-chain" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PVLT Server running on port ${PORT}`));
