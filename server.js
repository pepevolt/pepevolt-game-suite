require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory database tracking (for production, replace with MongoDB or PostgreSQL)
const db = {}; 

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const walletSigner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

function getUser(wallet) {
    const addr = wallet.toLowerCase();
    if (!db[addr]) {
        db[addr] = { points: 0, energy: 50, pvltBalance: 0.0, nonce: 0 };
    }
    return db[addr];
}

app.post('/user', (req, res) => {
    res.json(getUser(req.body.wallet));
});

app.post('/tap', (req, res) => {
    const user = getUser(req.body.wallet);
    if (user.energy <= 0) return res.status(400).json({ error: "No energy" });
    user.points += 1;
    user.energy -= 1;
    res.json(user);
});

// The Convert Logic: 10,000 gPVLT Points -> 1 Spendable PVLT
app.post('/swap-points', (req, res) => {
    const user = getUser(req.body.wallet);
    if (user.points < 10000) return res.status(400).json({ error: "Minimum 10,000 gPVLT required" });
    
    const increment = Math.floor(user.points / 10000);
    user.points = user.points % 10000; // Keep the remainder points
    user.pvltBalance += increment;
    
    res.json(user);
});

app.post('/refill', (req, res) => {
    const user = getUser(req.body.wallet);
    user.energy += 10000; 
    res.json(user);
});

// Secure On-Chain Cryptographic Claim Signature Generator
app.post('/claim-pvlt', async (req, res) => {
    const user = getUser(req.body.wallet);
    const claimAmount = Math.floor(user.pvltBalance);

    if (claimAmount < 100 || claimAmount > 500) {
        return res.status(400).json({ error: "Claims must be between 100 and 500 PVLT" });
    }

    try {
        // Construct the cryptographic hash payload to verify on-chain
        const messageHash = ethers.utils.solidityKeccak256(
            ["address", "uint256", "uint256", "address"],
            [req.body.wallet, claimAmount, user.nonce, process.env.TREASURY_VAULT_ADDRESS]
        );
        
        const signature = await walletSigner.signMessage(ethers.utils.arrayify(messageHash));
        
        user.pvltBalance -= claimAmount;
        user.nonce += 1; // Sync the nonces to avoid replay loops

        res.json({ claimAmount, signature, remainingPvlt: user.pvltBalance });
    } catch (err) {
        res.status(500).json({ error: "Signature mapping failed" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Engine active on port ${PORT}`));
