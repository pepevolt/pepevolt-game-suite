const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// memory storage
const users = {};

function getUser(wallet) {
  if (!users[wallet]) {
    users[wallet] = { score: 0, lastTap: 0 };
  }
  return users[wallet];
}

// test route
app.get("/", (req, res) => {
  res.send("PEPEVOLT API RUNNING 🚀");
});

// TAP
app.post("/tap", (req, res) => {
  const { wallet } = req.body;

  if (!wallet) return res.json({ error: "No wallet" });

  const user = getUser(wallet);

  const now = Date.now();
  if (now - user.lastTap < 300) {
    return res.json({ error: "Too fast" });
  }

  user.lastTap = now;
  user.score += 1;

  res.json({
    wallet,
    score: user.score
  });
});

// LEADERBOARD (IMPORTANT)
app.get("/leaderboard", (req, res) => {
  res.json(users);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("PEPEVOLT server running on port " + PORT);
});