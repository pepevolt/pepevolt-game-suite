require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

// Production Hint: For live scales, replace this runtime memory object with MongoDB or PostgreSQL
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
    if (user.energy <= 0) return res.status(400).json({ error: "Out of energy! Purchase premium energy packs." });
    
    user.points += 1;
    user.energy -= 1;
    res.json(user);
});

// Conversion Logic: 10,000 gPVLT Points -> 1 Spendable UI Asset 
app.post('/swap-points', (req, res) => {
    const user = getUser(req.body.wallet);
    if (user.points < 10000) return res.status(400).json({ error: "Need a minimum of 10,000 gPVLT to convert into real balance assets." });
    
    const increment = Math.floor(user.points / 10000);
    user.points = user.points % 10000; 
    user.pvltBalance += increment;
    
    res.json(user);
});

app.post('/refill', (req, res) => {
    const user = getUser(req.body.wallet);
    user.energy += 10000; 
    res.json(user);
});

// On-Chain Cryptographic Claim Signature Ticket Generator
app.post('/claim-pvlt', async (req, res) => {
    const user = getUser(req.body.wallet);
    const claimAmount = Math.floor(user.pvltBalance);

    if (claimAmount < 100 || claimAmount > 500) {
        return res.status(400).json({ error: `Claim Restricted: Your balance is ${user.pvltBalance.toFixed(2)} PVLT. You can only claim when your balance is between 100 and 500 PVLT.` });
    }

    try {
        const messageHash = ethers.utils.solidityKeccak256(
            ["address", "uint256", "uint256", "address"],
            [req.body.wallet, claimAmount, user.nonce, process.env.TREASURY_VAULT_ADDRESS]
        );
        
        const signature = await walletSigner.signMessage(ethers.utils.arrayify(messageHash));
        
        user.pvltBalance -= claimAmount;
        user.nonce += 1; 

        res.json({ claimAmount, signature, remainingPvlt: user.pvltBalance });
    } catch (err) {
        res.status(500).json({ error: "Claim processing signature generation failed." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Ecosystem Core listening active on port ${PORT}`));
