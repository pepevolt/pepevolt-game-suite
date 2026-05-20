const express = require("express");
const ethers = require("ethers");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const walletSigner = new ethers.Wallet(process.env.PRIVATE_KEY);
const tapsHistory = {};

app.post("/api/tap", (req, res) => {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ error: "Missing wallet parameter" });

    const clientTimestamp = Date.now();
    if (!tapsHistory[wallet]) tapsHistory[wallet] = { lastTap: 0 };

    if (clientTimestamp - tapsHistory[wallet].lastTap < 120) {
        return res.status(403).json({ error: "Rate limit: Tapping too fast" });
    }

    tapsHistory[wallet].lastTap = clientTimestamp;
    res.json({ success: true });
});

app.post("/api/sign-swap", async (req, res) => {
    try {
        const { wallet, gpvltAmount, pvltReward, nonce } = req.body;

        const messageHash = ethers.utils.solidityKeccak256(
            ["address", "uint256", "uint256", "uint256", "address"],
            [wallet, gpvltAmount, pvltReward, nonce, process.env.TREASURY_CONTRACT_ADDRESS]
        );

        const signature = await walletSigner.signMessage(ethers.utils.arrayify(messageHash));
        res.json({ success: true, signature });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend execution engine active on port ${PORT}`));
