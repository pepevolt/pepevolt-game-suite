require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
const PORT = process.env.PORT || 10000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://pepevolt.github.io';

// Deep CORS Configuration to solve mobile browser "Load failed" drops
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || origin === 'null' || origin.startsWith('https://pepevolt.github.io')) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by Security Policy (CORS)'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Pre-flight across all router lanes
app.use(express.json());

/* ================= IN-MEMORY SIMULATED DB ================= */
// Replace with MongoDB or Redis later if needed
const usersDB = {};

// Contract Configs
const PVLT_TOKEN_ADDRESS = "0x75996Ad3FFd2fE2d55b38fDfAd974C5e9EBE5400";
const PVLTG_TOKEN_ADDRESS = "0x3FdCE8aB325E03d527605dd2f01730cd981F594F";

// Connect to Polygon network
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL || 'https://polygon-rpc.com');

/* ================= API ROUTES ================= */

// Health-check endpoint used to prevent Render spin-downs
app.get('/', (req, res) => {
    res.status(200).json({ status: "online", engine: "PepeVolt Game Suite", timestamp: new Date() });
});

// User State Loader
app.post('/user', (req, res) => {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: "Wallet address required" });

    const normalizedWallet = wallet.toLowerCase();
    
    if (!usersDB[normalizedWallet]) {
        usersDB[normalizedWallet] = {
            wallet: normalizedWallet,
            points: 0,
            energy: 50,
            pvltg: 0.0,
            lastRefill: Date.now()
        };
    }

    // Process background energy calculations since last request login
    const user = usersDB[normalizedWallet];
    const now = Date.now();
    const elapsed = now - user.lastRefill;
    const intervals = Math.floor(elapsed / 30000); // 1 energy per 30 seconds

    if (intervals > 0 && user.energy < 50) {
        user.energy = Math.min(50, user.energy + intervals);
        user.lastRefill = now;
    }

    res.json(user);
});

// Action Tapper Core
app.post('/tap', (req, res) => {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: "Wallet required" });

    const normalizedWallet = wallet.toLowerCase();
    const user = usersDB[normalizedWallet];

    if (!user) return res.status(404).json({ error: "User profile not initialized" });
    if (user.energy <= 0) return res.status(400).json({ error: "Out of Energy! Recharge or Buy an Energy Pack." });

    user.energy -= 1;
    user.points += 1;
    res.json({ points: user.points, energy: user.energy });
});

// Points to PVLTG internal currency converter
app.post('/swap-points', (req, res) => {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: "Wallet required" });

    const normalizedWallet = wallet.toLowerCase();
    const user = usersDB[normalizedWallet];

    if (!user) return res.status(404).json({ error: "User profile not found" });
    if (user.points < 10000) return res.status(400).json({ error: "Minimum conversion requirement is 10,000 Points" });

    const pvltgGained = Math.floor(user.points / 10000);
    user.points = user.points % 10000;
    user.pvltg += pvltgGained;

    res.json({ points: user.points, pvltg: user.pvltg });
});

// Energy Purchase validator verification endpoint
app.post('/refill', async (req, res) => {
    const { wallet, txHash } = req.body;
    if (!wallet || !txHash) return res.status(400).json({ error: "Missing verification criteria parameters" });

    const normalizedWallet = wallet.toLowerCase();
    const user = usersDB[normalizedWallet];
    if (!user) return res.status(404).json({ error: "User profile not found" });

    try {
        // Validate transaction hash validation rules against network live logs
        const tx = await provider.getTransaction(txHash);
        if (!tx) return res.status(400).json({ error: "Transaction identity not discovered on-chain yet" });

        const receipt = await tx.wait();
        if (receipt.status !== 1) return res.status(400).json({ error: "On-chain verification tracking logs show transaction failure" });

        // Add 100,000 Energy pack limits
        user.energy += 100000;
        res.json({ success: true, energy: user.energy });

    } catch (err) {
        console.error("Refill processing tracking error:", err);
        res.status(500).json({ error: "On-chain payload transaction execution processing failure" });
    }
});

// External Token Claims Trigger Entry Router
app.post('/claim-pvltg', (req, res) => {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: "Wallet required" });

    const normalizedWallet = wallet.toLowerCase();
    const user = usersDB[normalizedWallet];

    if (!user) return res.status(404).json({ error: "User profile not found" });
    if (user.pvltg < 100) return res.status(400).json({ error: "Minimum milestone transfer standard is 100 PVLTG" });

    // Deduct total local balances
    user.pvltg = 0;
    res.json({ success: true, pvltg: user.pvltg });
});

// Port Execution listeners
app.listen(PORT, () => {
    console.log(`PepeVolt Game Suite online and streaming on port: ${PORT}`);
    console.log(`Configured to accept incoming cross-origin headers from: ${ALLOWED_ORIGIN}`);
});
