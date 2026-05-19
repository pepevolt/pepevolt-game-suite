import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ================= STORAGE ================= */

const users = {};

/* ================= POLYGON SETUP ================= */

let provider;
let wallet;
let pvltContract;

try {
    const rpcUrl = process.env.RPC_URL || "https://polygon-rpc.com";
    const privateKey = process.env.PRIVATE_KEY;
    
    // Explicit token address definition for PEPEVOLT (PVLT)
    const pvltAddress = "0xC096dB70Fa05255b210Be58Ec2508Bed61e8dfD6";

    provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
        chainId: 137,
        name: "polygon"
    });

    if (privateKey) {
        wallet = new ethers.Wallet(privateKey, provider);

        // Standard ERC-20 interface snippet allowing the server to push tokens
        const pvltAbi = [
            "function transfer(address to, uint256 amount) external returns (bool)",
            "function balanceOf(address account) external view returns (uint256)"
        ];

        pvltContract = new ethers.Contract(pvltAddress, pvltAbi, wallet);
    } else {
        console.warn("WARNING: PRIVATE_KEY environment variable is not set.");
    }
} catch (error) {
    console.error("Initialization Error during app startup:", error.message);
}

/* ================= HEALTH ================= */

app.get("/", (req, res) => {
    res.send("PVLT SERVER RUNNING");
});

/* ================= CREATE USER ================= */

app.post("/user", (req, res) => {
    const { wallet: userWallet } = req.body;

    if (!userWallet) {
        return res.json({
            error: "Wallet required"
        });
    }

    const addressKey = userWallet.toLowerCase();

    if (!users[addressKey]) {
        users[addressKey] = {
            points: 0,
            energy: 50,
            pvltg: 0,
            lastRefill: Date.now()
        };
    }

    res.json(users[addressKey]);
});

/* ================= TAP ================= */

app.post("/tap", (req, res) => {
    const { wallet: userWallet } = req.body;
    if (!userWallet) return res.json({ error: "Wallet required" });

    const addressKey = userWallet.toLowerCase();
    const user = users[addressKey];

    if (!user) {
        return res.json({
            error: "User not found"
        });
    }

    /* ================= AUTO REFILL ================= */

    const now = Date.now();
    const diff = Math.floor((now - user.lastRefill) / 30000);

    if (diff > 0) {
        user.energy += diff;
        user.lastRefill = now;
    }

    /* ================= TAP EXECUTION ================= */

    if (user.energy <= 0) {
        return res.json({
            error: "No energy"
        });
    }

    user.energy -= 1;
    user.points += 1;

    res.json({
        points: user.points,
        energy: user.energy,
        pvltg: user.pvltg
    });
});

/* ================= BUY ENERGY ================= */

app.post("/refill", (req, res) => {
    const { wallet: userWallet, txHash } = req.body;
    if (!userWallet) return res.json({ error: "Wallet required" });

    const addressKey = userWallet.toLowerCase();
    const user = users[addressKey];

    if (!user) {
        return res.json({
            error: "User not found"
        });
    }

    if (!txHash) {
        return res.json({
            error: "Transaction hash missing"
        });
    }

    user.energy += 10000;
    console.log("ENERGY PURCHASE:", addressKey, txHash);

    res.json({
        success: true,
        energy: user.energy
    });
});

/* ================= SWAP POINTS ================= */

app.post("/swap-points", (req, res) => {
    const { wallet: userWallet } = req.body;
    if (!userWallet) return res.json({ error: "Wallet required" });

    const addressKey = userWallet.toLowerCase();
    const user = users[addressKey];

    if (!user) {
        return res.json({
            error: "User not found"
        });
    }

    if (user.points < 10) {
        return res.json({
            error: "Need 10 points"
        });
    }

    const earned = Math.floor(user.points / 10);
    user.points = 0;
    user.pvltg += earned;

    res.json({
        success: true,
        pvltg: user.pvltg
    });
});

/* ================= CLAIM PVLTG ================= */

app.post("/claim-pvltg", async (req, res) => {
    try {
        const { wallet: userWallet } = req.body;
        if (!userWallet) return res.json({ error: "Wallet required" });

        const addressKey = userWallet.toLowerCase();
        const user = users[addressKey];

        if (!user) {
            return res.json({
                error: "User not found"
            });
        }

        /* ================= MINIMUM REQUIREMENT ================= */

        if (user.pvltg < 10) {
            return res.json({
                error: "Need minimum 10 PVLTG"
            });
        }

        if (!pvltContract) {
            return res.json({
                error: "Server token configuration is missing or private key unconfigured."
            });
        }

        // Calculation: 10 PVLTG inside database = 1 real PVLT token on-chain
        const pvltAmountToPayout = user.pvltg / 10;
        const amountInWei = ethers.utils.parseEther(pvltAmountToPayout.toString());

        console.log(`Processing payout for ${addressKey}. Sending ${pvltAmountToPayout} PVLT tokens directly.`);

        /* ================= DIRECT TRANSFER TO USER WALLET ================= */
        
        // Server sends PVLT directly from its balance to the player's personal wallet address
        const tx = await pvltContract.transfer(addressKey, amountInWei);
        
        // Wait for block verification on Polygon
        await tx.wait();

        /* ================= RESET BALANCE ================= */

        user.pvltg = 0;

        res.json({
            success: true,
            tx: tx.hash
        });

    } catch (err) {
        console.error("CRITICAL ERROR DURING TOKEN PAYOUT TRANSACTION:", err);
        res.json({
            error: "Claim failed on-chain: " + (err.reason || err.message || "Unknown token error")
        });
    }
});

/* ================= START ================= */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`PVLT SERVER RUNNING ON PORT ${PORT}`);
});
