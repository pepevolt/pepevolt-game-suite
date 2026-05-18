const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

// Polygon RPC ([Polygon Labs](chatgpt://generic-entity?number=1))
const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");

// ADMIN WALLET (PRIVATE KEY in Render ENV)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// GAME TOKEN CONTRACT
const GAME_TOKEN = "0xcaf3f8172d8accaa87d3eb9f679b693d04976aee";

const abi = [
  "function mint(address to, uint256 amount) external"
];

const contract = new ethers.Contract(GAME_TOKEN, abi, wallet);

// MEMORY DB
const users = {};

function getUser(wallet) {
  if (!users[wallet]) users[wallet] = { score: 0, lastTap: 0 };
  return users[wallet];
}

// TAP
app.post("/tap", (req, res) => {
  const { wallet } = req.body;

  const user = getUser(wallet);

  const now = Date.now();
  if (now - user.lastTap < 300) {
    return res.json({ error: "Too fast" });
  }

  user.lastTap = now;
  user.score += 1;

  res.json({ wallet, score: user.score });
});

// CLAIM
app.post("/claim", async (req, res) => {
  const { wallet } = req.body;

  const user = getUser(wallet);

  const reward = Math.floor(user.score / 100);

  if (reward <= 0) {
    return res.json({ error: "No reward" });
  }

  try {
    const tx = await contract.mint(
      wallet,
      ethers.parseUnits(reward.toString(), 18)
    );

    await tx.wait();

    user.score = 0;

    res.json({
      success: true,
      minted: reward,
      tx: tx.hash
    });

  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(3000, () => console.log("PEPEVOLT backend running"));