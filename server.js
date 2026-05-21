require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Safe memory DB
const db = {}; 

const PVLT_TOKEN_ADDRESS = "0xce363c769BA1A1CDf2A7500B39CB996856E81D16";
const GAME_TREASURY_ADDRESS = "0x10c6db776d58AF42143677ee847F007D9f91B5D2";

// Initialize a reliable RPC provider on the server side
const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const walletSigner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const tokenContractReadOnly = new ethers.Contract(PVLT_TOKEN_ADDRESS, ["function balanceOf(address owner) view returns (uint256)"], provider);

// Helper to fetch server-side Treasury Vault balance
async function getTreasuryVaultBalance() {
    try {
        const rawTreasury = await tokenContractReadOnly.balanceOf(GAME_TREASURY_ADDRESS);
        return parseFloat(ethers.utils.formatUnits(rawTreasury, 18));
    } catch (e) {
        console.error("Failed fetching treasury balance:", e);
        return 0.00; // Fallback value
    }
}

function getUser(wallet) {
    if (!wallet) return null;
    const addr = wallet.toLowerCase();
    if (!db[addr]) {
        db[addr] = { points: 0, energy: 50, pvltBalance: 0.0, nonce: 0 };
    }
    return db[addr];
}

// FIXED: Added root GET router handler to resolve 'Cannot GET /' web view error
app.get('/', (req, res) => {
    res.send("PVLT Engine Operational");
});

app.post('/user', async (req, res) => {
    const user = getUser(req.body.wallet);
    if(!user) return res.status(400).json({ error: "Invalid address argument provided." });
    
    // Fetch live treasury data server-side
    const currentTreasury = await getTreasuryVaultBalance();
    res.json({ ...user, treasuryCapacity: currentTreasury });
});

app.post('/tap', async (req, res) => {
    const user = getUser(req.body.wallet);
    if(!user) return res.status(400).json({ error: "Invalid address argument provided." });
    
    if (user.energy <= 0) {
        return res.status(400).json({ error: "Out of energy! Purchase premium energy packs." });
    }
    
    user.points += 1;
    user.energy -= 1;
    
    const currentTreasury = await getTreasuryVaultBalance();
    res.json({ ...user, treasuryCapacity: currentTreasury });
});

app.post('/swap-points', async (req, res) => {
    const user = getUser(req.body.wallet);
    if(!user) return res.status(400).json({ error: "Invalid profile contextualized." });
    if (user.points < 10000) return res.status(400).json({ error: "Need a minimum of 10,000 gPVLT to convert." });
    
    const increment = Math.floor(user.points / 10000);
    user.points = user.points % 10000; 
    user.pvltBalance += increment;
    
    const currentTreasury = await getTreasuryVaultBalance();
    res.json({ ...user, treasuryCapacity: currentTreasury });
});

app.post('/refill', async (req, res) => {
    const user = getUser(req.body.wallet);
    if(!user) return res.status(400).json({ error: "Invalid target user handle." });
    user.energy += 10000; 
    
    const currentTreasury = await getTreasuryVaultBalance();
    res.json({ ...user, treasuryCapacity: currentTreasury });
});

app.post('/claim-pvlt', async (req, res) => {
    const user = getUser(req.body.wallet);
    if(!user) return res.status(400).json({ error: "Invalid target user profile." });
    
    const claimAmount = Math.floor(user.pvltBalance);
    if (claimAmount < 100 || claimAmount > 500) {
        return res.status(400).json({ error: `Claim Restricted: Your balance is ${user.pvltBalance.toFixed(2)} PVLT.` });
    }

    try {
        const messageHash = ethers.utils.solidityKeccak256(
            ["address", "uint256", "uint256", "address"],
            [req.body.wallet, claimAmount, user.nonce, GAME_TREASURY_ADDRESS]
        );
        
        const signature = await walletSigner.signMessage(ethers.utils.arrayify(messageHash));
        
        user.pvltBalance -= claimAmount;
        user.nonce += 1; 

        const currentTreasury = await getTreasuryVaultBalance();
        res.json({ claimAmount, signature, remainingPvlt: user.pvltBalance, treasuryCapacity: currentTreasury });
    } catch (err) {
        res.status(500).json({ error: "Claim processing signature generation failed." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Ecosystem Core listening active on port ${PORT}`));
