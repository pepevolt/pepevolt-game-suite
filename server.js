import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const users = {};

// Hardcoding network details prevents 'could not detect network' errors during RPC latency spikes
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL, {
    chainId: 137,
    name: "polygon"
});
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

/* ================= CONTRACTS ================= */
const pvltgAbi = [
    "function mint(address to,uint256 amount) external",
    "function burnFrom(address account, uint256 amount) external"
];

const gameAbi = [
    "function swapPVLTGtoPVLT(uint256 amount) external",
    "function swapPVLTGtoPVLT(address user, uint256 amount) external"
];

const pvltg = new ethers.Contract(process.env.PVLTG, pvltgAbi, wallet);
const gameEngine = new ethers.Contract(process.env.ENGINE, gameAbi, wallet);

app.get("/",(req,res)=>{ res.send("PVLT SERVER RUNNING"); });

app.post("/user",(req,res)=>{
    const { wallet } = req.body;
    if(!wallet){ return res.json({ error:"Wallet required" }); }
    if(!users[wallet]){
        users[wallet] = { points:0, energy:50, pvltg:0, lastRefill:Date.now() };
    }
    res.json(users[wallet]);
});

app.post("/tap",(req,res)=>{
    const { wallet } = req.body;
    const user = users[wallet];
    if(!user){ return res.json({ error:"User not found" }); }

    const now = Date.now();
    const diff = Math.floor((now - user.lastRefill) / 30000);
    if(diff > 0){ user.energy += diff; user.lastRefill = now; }

    if(user.energy <= 0){ return res.json({ error:"No energy" }); }
    user.energy -= 1;
    user.points += 1;

    res.json({ points:user.points, energy:user.energy, pvltg:user.pvltg });
});

app.post("/refill",(req,res)=>{
    const { wallet, txHash } = req.body;
    const user = users[wallet];
    if(!user){ return res.json({ error:"User not found" }); }
    if(!txHash){ return res.json({ error:"Transaction hash missing" }); }

    user.energy += 10000;
    res.json({ success:true, energy:user.energy });
});

/* ================= SWAP POINTS ================= */
app.post("/swap-points",(req,res)=>{
    const { wallet } = req.body;
    const user = users[wallet];
    if(!user){ return res.json({ error:"User not found" }); }
    
    // 100 Points minimum required
    if(user.points < 100){ return res.json({ error:"Need minimum 100 points to swap" }); }

    // Conversion: 100 Points = 1 PVLTG
    const earned = Math.floor(user.points / 100);
    user.points = user.points % 100; 
    user.pvltg += earned;

    res.json({ success:true, pvltg:user.pvltg, remainingPoints: user.points });
});

/* ================= CLAIM PVLTG ================= */
app.post("/claim-pvltg", async(req, res)=>{
    try{
        const { wallet: userWallet } = req.body;
        const user = users[userWallet];

        if(!user){ return res.json({ error:"User not found" }); }
        
        // 10 PVLTG minimum required to trigger claim
        if(user.pvltg < 10){ return res.json({ error:"Need minimum 10 PVLTG" }); }

        const amount = ethers.utils.parseEther(user.pvltg.toString());

        console.log(`Processing claim for ${userWallet} of amount ${user.pvltg}`);

        // Step 1: Mint the user's earned PVLTG directly to their wallet first
        const mintTx = await pvltg.mint(userWallet, amount);
        await mintTx.wait();

        // Step 2: Swap action
        let swapTx;
        try {
            swapTx = await gameEngine.swapPVLTGtoPVLT(userWallet, amount);
        } catch(e) {
            swapTx = await gameEngine.swapPVLTGtoPVLT(amount);
        }
        await swapTx.wait();

        user.pvltg = 0;
        res.json({ success:true, tx: swapTx.hash });

    }catch(err){
        console.error("CRITICAL ERROR DURING CLAIM ATTEMPT:", err);
        res.json({ error: "Claim processing failed on-chain: " + (err.reason || err.message) });
    }
});

app.listen(process.env.PORT || 10000, ()=>{ console.log("PVLT SERVER RUNNING"); });
