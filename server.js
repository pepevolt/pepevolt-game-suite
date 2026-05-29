<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>PepeVolt | Tap to Earn PVLT</title>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: #03060c;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
}

.app {
  width: 100%;
  max-width: 440px;
  height: 100dvh;
  background: radial-gradient(circle at 30% 0%, #13223f 0%, #03060c 90%);
  display: flex;
  flex-direction: column;
  padding: 18px 16px 24px;
  position: relative;
  overflow-y: auto;
}

.top-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.stat-card {
  background: rgba(10, 20, 35, 0.65);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 255, 200, 0.25);
  border-radius: 20px;
  padding: 8px 4px;
  text-align: center;
}

.stat-label {
  font-size: 9px;
  font-weight: 500;
  color: #8aaee0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: white;
  font-family: monospace;
  text-shadow: 0 0 6px #00e0c0;
  line-height: 1.3;
}

.stat-value.blurred {
  filter: blur(4px);
  opacity: 0.4;
}

.stat-value.small {
  font-size: 14px;
}

.energy-bar-container {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  height: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.energy-bar-fill {
  background: linear-gradient(90deg, #46c9b0, #00ffd5);
  width: 100%;
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 20px;
}

.action-btn {
  width: 100%;
  border: none;
  border-radius: 44px;
  padding: 14px 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease;
  font-family: inherit;
  text-align: center;
  background: linear-gradient(95deg, #46c9b0, #1d9b87);
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.buy-energy-btn {
  background: linear-gradient(95deg, #ffd966, #f5b042);
  color: #0a1a22;
}

#connectWalletBtn {
  margin-bottom: 12px;
}

#connectWalletBtn.connected {
  background: linear-gradient(95deg, #ef4444, #dc2626);
}

.status-bar {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 20px;
  padding: 10px 12px;
  margin-bottom: 12px;
  text-align: center;
  font-size: 11px;
  color: #b9d0ff;
  word-break: break-word;
}

.tap-arena {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.pepe-core {
  width: min(58vw, 220px);
  height: min(58vw, 220px);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #00ebbc, #008f74);
  border: 6px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 48px rgba(0, 250, 180, 0.5);
  cursor: pointer;
  transition: transform 0.05s linear;
}

.pepe-core:active {
  transform: scale(0.94);
}

.pepe-core.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pepe-core.disabled:active {
  transform: none;
}

.pepe-core img {
  width: 82%;
  pointer-events: none;
}

.action-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.float-number {
  position: fixed;
  color: #e6ff73;
  font-weight: 900;
  text-shadow: 0 0 8px #00b37e;
  pointer-events: none;
  font-size: 1.3rem;
  z-index: 9999;
  animation: floatUp 0.75s ease-out forwards;
}

@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0px); }
  100% { opacity: 0; transform: translateY(-70px); }
}

.progress-container {
  background: rgba(0,0,0,0.5);
  border-radius: 20px;
  padding: 8px 12px;
  margin-bottom: 12px;
  text-align: center;
}

.progress-label {
  font-size: 10px;
  color: #8aaee0;
  margin-bottom: 4px;
}

.progress-bar {
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  height: 6px;
  overflow: hidden;
  margin: 4px 0;
}

.progress-fill {
  background: linear-gradient(90deg, #ffd966, #f5b042);
  width: 0%;
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 20px;
}

.tap-count {
  font-size: 11px;
  color: #ffd966;
  margin-top: 4px;
}

.treasury-note {
  font-size: 9px;
  text-align: center;
  margin-top: 10px;
  color: #4f699b;
  cursor: pointer;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

.energy-text {
  font-size: 10px;
  color: #46c9b0;
  margin-top: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.countdown {
  font-size: 10px;
  color: #ffaa44;
  margin-left: 4px;
}
</style>
<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
<script type="importmap">
  {
    "imports": {
      "@walletconnect/ethereum-provider": "https://esm.sh/@walletconnect/ethereum-provider@2.11.0"
    }
  }
</script>
</head>

<body>
<div class="app">
  <div class="top-stats">
    <div class="stat-card">
      <div class="stat-label">⚡ ENERGY</div>
      <div class="stat-value" id="energyDisplay">50</div>
      <div class="energy-text" id="energyTimer"></div>
    </div>
    <div class="stat-card">
      <div class="stat-label">🔄 TAPS</div>
      <div class="stat-value small" id="tapsDisplay">0/100</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">💎 GAME PVLT</div>
      <div class="stat-value" id="gamePvltDisplay">0</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">💼 WALLET</div>
      <div class="stat-value small" id="walletPvltDisplay">0</div>
    </div>
  </div>

  <div class="energy-bar-container">
    <div class="energy-bar-fill" id="energyBarFill"></div>
  </div>

  <div class="progress-container">
    <div class="progress-label">🎯 PROGRESS TO NEXT PVLT</div>
    <div class="progress-bar">
      <div class="progress-fill" id="tapProgressFill"></div>
    </div>
    <div class="tap-count" id="tapCountText">0/100 taps = 1 PVLT</div>
  </div>

  <button class="action-btn" id="connectWalletBtn">🔌 CONNECT WALLET (POLYGON)</button>

  <div class="status-bar" id="statusBar">
    🔒 Connect wallet to start earning PVLT
  </div>

  <div class="tap-arena">
    <div class="pepe-core disabled" id="tapButton">
      <img src="https://i.imgur.com/8Km9tLL.png" alt="PEPE">
    </div>
  </div>

  <div class="action-stack">
    <button class="action-btn buy-energy-btn" id="buyEnergyAction" disabled>⚡ BUY 100 ENERGY (1 PVLT)</button>
    <button class="action-btn" id="claimPvltAction" disabled>💎 CLAIM GAME PVLT → WALLET</button>
  </div>
  <div class="treasury-note" id="treasuryNote">
    🏆 100 taps = 1 PVLT | Energy regens every 15s
  </div>
</div>

<script type="module">
  import { EthereumProvider } from "@walletconnect/ethereum-provider";

  // ============ CONTRACT ADDRESSES (UPDATE THESE) ============
  const PVLT_TOKEN_ADDRESS = "0x5f7df6862f439b691507dc20069f4f73a37cb08b";  // Your PVLT.sol
  const TREASURY_VOLT = "0x4251Ef24D10bf637494C173621F5f84262e9Bda5";
  
  // ============ CONTRACT ABIs ============
  const PVLT_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)",
    "function decimals() view returns (uint8)",
    "function approve(address, uint256) returns (bool)"
  ];

  // DOM Elements
  const connectBtn = document.getElementById("connectWalletBtn");
  const energySpan = document.getElementById("energyDisplay");
  const energyBarFill = document.getElementById("energyBarFill");
  const energyTimer = document.getElementById("energyTimer");
  const tapsDisplay = document.getElementById("tapsDisplay");
  const tapCountText = document.getElementById("tapCountText");
  const gamePvltSpan = document.getElementById("gamePvltDisplay");
  const walletPvltSpan = document.getElementById("walletPvltDisplay");
  const tapCircle = document.getElementById("tapButton");
  const buyBtn = document.getElementById("buyEnergyAction");
  const claimBtn = document.getElementById("claimPvltAction");
  const statusBar = document.getElementById("statusBar");
  const tapProgressFill = document.getElementById("tapProgressFill");

  // Game State (New Economy)
  let maxEnergy = 50;
  let energy = 50;
  let currentTaps = 0;
  let tapsRequired = 100;  // 100 taps = 1 PVLT
  let gamePvltBalance = 0;
  let walletBalance = 0;
  let decimals = 18;
  let userAccount = null;
  let tokenContract = null;
  let provider = null;
  let isLoading = false;
  let lastRegenTime = Date.now();
  let regenInterval = null;

  function showFloat(x, y, text, color = "#e6ff73") {
    const el = document.createElement("div");
    el.className = "float-number";
    el.innerText = text;
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.color = color;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }

  function saveData() {
    if (userAccount) {
      localStorage.setItem(`pvlt_game_${userAccount}`, JSON.stringify({ 
        energy, 
        currentTaps,
        gamePvltBalance,
        lastRegenTime
      }));
    }
  }

  function loadData() {
    if (userAccount) {
      const saved = localStorage.getItem(`pvlt_game_${userAccount}`);
      if (saved) {
        const d = JSON.parse(saved);
        energy = d.energy ?? 50;
        currentTaps = d.currentTaps ?? 0;
        gamePvltBalance = d.gamePvltBalance ?? 0;
        lastRegenTime = d.lastRegenTime ?? Date.now();
      } else {
        energy = 50;
        currentTaps = 0;
        gamePvltBalance = 0;
        lastRegenTime = Date.now();
      }
    }
    updateTapProgress();
  }

  function updateEnergyBar() {
    const percent = (energy / maxEnergy) * 100;
    energyBarFill.style.width = `${percent}%`;
    energySpan.innerText = Math.floor(energy);
  }

  function updateTapProgress() {
    const percent = (currentTaps / tapsRequired) * 100;
    tapProgressFill.style.width = `${percent}%`;
    tapsDisplay.innerText = `${currentTaps}/${tapsRequired}`;
    tapCountText.innerHTML = `${currentTaps}/${tapsRequired} taps = ${(currentTaps / tapsRequired).toFixed(2)} PVLT`;
    
    if (currentTaps >= tapsRequired) {
      statusBar.innerHTML = "🎉 READY TO CLAIM! Keep tapping to earn more PVLT! 🎉";
    }
  }

  async function updateWalletBalance() {
    if (!userAccount || !tokenContract) { 
      walletBalance = 0; 
      return; 
    }
    try {
      const bal = await tokenContract.balanceOf(userAccount);
      walletBalance = parseFloat(ethers.utils.formatUnits(bal, decimals));
    } catch(e) { 
      walletBalance = 0; 
    }
  }

  async function refreshUI() {
    updateEnergyBar();
    gamePvltSpan.innerText = gamePvltBalance.toFixed(4);
    
    if (userAccount) {
      await updateWalletBalance();
      walletPvltSpan.innerText = walletBalance.toFixed(4);
      
      energySpan.classList.remove("blurred");
      tapsDisplay.classList.remove("blurred");
      gamePvltSpan.classList.remove("blurred");
      walletPvltSpan.classList.remove("blurred");
      tapCircle.classList.remove("disabled");
      buyBtn.disabled = false;
      claimBtn.disabled = gamePvltBalance < 0.0001;
      
      connectBtn.classList.add("connected");
      connectBtn.innerHTML = `🔴 DISCONNECT ${userAccount.slice(0,6)}...${userAccount.slice(-4)}`;
      statusBar.innerHTML = `✅ Connected | 💼 ${walletBalance.toFixed(4)} PVLT | ⚡ ${Math.floor(energy)}/${maxEnergy} energy | 🎯 ${currentTaps}/${tapsRequired} taps`;
    } else {
      energySpan.classList.add("blurred");
      tapsDisplay.classList.add("blurred");
      gamePvltSpan.classList.add("blurred");
      walletPvltSpan.classList.add("blurred");
      tapCircle.classList.add("disabled");
      buyBtn.disabled = true;
      claimBtn.disabled = true;
      connectBtn.classList.remove("connected");
      connectBtn.innerHTML = "🔌 CONNECT WALLET (POLYGON)";
      statusBar.innerHTML = "🔒 Connect wallet to start earning PVLT";
    }
  }

  function regenEnergy() {
    if (!userAccount) return;
    
    const now = Date.now();
    const secondsSinceLastRegen = Math.floor((now - lastRegenTime) / 1000);
    
    if (secondsSinceLastRegen >= 15 && energy < maxEnergy) {
      const regenAmount = Math.min(Math.floor(secondsSinceLastRegen / 15), maxEnergy - energy);
      if (regenAmount > 0) {
        energy = Math.min(energy + regenAmount, maxEnergy);
        lastRegenTime = now;
        refreshUI();
        saveData();
        
        // Show regen notification
        if (regenAmount > 0 && energy < maxEnergy) {
          energyTimer.innerText = `+${regenAmount} in ${15 - (secondsSinceLastRegen % 15)}s`;
        } else {
          energyTimer.innerText = '';
        }
      }
    }
    
    // Update timer display
    if (energy < maxEnergy) {
      const secondsSinceLast = Math.floor((Date.now() - lastRegenTime) / 1000);
      const secondsLeft = 15 - (secondsSinceLast % 15);
      energyTimer.innerText = `next +1 in ${secondsLeft}s`;
    } else {
      energyTimer.innerText = '⚡ full';
    }
  }

  async function handleTap(x, y) {
    if (!userAccount) {
      showFloat(x, y, "🔒 Connect first!", "#ff8888");
      return;
    }
    if (energy <= 0) {
      showFloat(x, y, "❌ Out of energy! Wait or buy more!", "#ff8888");
      return;
    }
    
    // Deduct energy
    energy = Math.max(0, energy - 1);
    currentTaps++;
    
    // Check if earned PVLT
    let earnedPvlt = 0;
    if (currentTaps >= tapsRequired) {
      earnedPvlt = Math.floor(currentTaps / tapsRequired);
      gamePvltBalance += earnedPvlt;
      currentTaps = currentTaps % tapsRequired;
      showFloat(x, y - 30, `🎉 +${earnedPvlt} PVLT! 🎉`, "#ffea80");
    }
    
    updateTapProgress();
    showFloat(x, y, earnedPvlt > 0 ? `+1 TAP +${earnedPvlt} PVLT` : "+1 TAP", "#aaffdd");
    
    if (navigator.vibrate) navigator.vibrate(20);
    refreshUI();
    saveData();
  }

  async function buyEnergy() {
    if (!userAccount) { alert("Connect wallet first"); return; }
    await updateWalletBalance();
    if (walletBalance < 1) {
      alert(`Need 1 PVLT. You have ${walletBalance.toFixed(4)}`);
      return;
    }
    
    const amount = ethers.utils.parseUnits("1", decimals);
    try {
      statusBar.innerHTML = "⏳ Processing energy purchase...";
      const tx = await tokenContract.transfer(TREASURY_VOLT, amount);
      await tx.wait();
      await updateWalletBalance();
      energy = Math.min(energy + 100, maxEnergy);
      refreshUI();
      saveData();
      statusBar.innerHTML = "✅ +100 Energy! Keep tapping!";
      showFloat(window.innerWidth/2, window.innerHeight/2, "⚡ +100 ENERGY ⚡", "#ffd966");
    } catch(e) { 
      alert("Failed: " + e.message);
      statusBar.innerHTML = "❌ Purchase failed";
    }
  }

  async function claimToWallet() {
    if (!userAccount) { alert("Connect wallet"); return; }
    if (gamePvltBalance < 0.001) { 
      alert("No game PVLT to claim. Keep tapping! Need 100 taps for 1 PVLT"); 
      return;
    }
    
    const amountWei = ethers.utils.parseUnits(gamePvltBalance.toFixed(decimals), decimals);
    
    try {
      statusBar.innerHTML = "⏳ Claiming PVLT to your wallet...";
      const tx = await tokenContract.transfer(userAccount, amountWei);
      await tx.wait();
      gamePvltBalance = 0;
      refreshUI();
      saveData();
      statusBar.innerHTML = `✅ Claimed ${gamePvltBalance.toFixed(4)} PVLT to wallet!`;
      showFloat(window.innerWidth/2, window.innerHeight/2, `💎 +${gamePvltBalance.toFixed(2)} PVLT 💎`, "#46c9b0");
    } catch(e) { 
      alert("Claim failed: " + e.message);
      statusBar.innerHTML = "❌ Claim failed";
    }
  }

  async function disconnect() {
    if (provider) {
      try { await provider.disconnect(); } catch(e) {}
    }
    saveData();
    provider = null;
    userAccount = null;
    tokenContract = null;
    isLoading = false;
    lastRegenTime = Date.now();
    await refreshUI();
  }

  async function connect() {
    if (isLoading) return;
    isLoading = true;
    connectBtn.innerHTML = `<span class="loading-spinner"></span> CONNECTING...`;
    connectBtn.disabled = true;
    
    try {
      const wcProvider = await EthereumProvider.init({
        projectId: "1731f99148b9cf6107dee70b6efb14b7",
        chains: [137],
        showQrModal: true,
        methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData", "eth_accounts", "eth_requestAccounts"],
        rpcMap: { 137: "https://polygon-rpc.com" },
        metadata: {
          name: "PepeVolt Game",
          description: "Tap to Earn PVLT tokens on Polygon",
          url: window.location.origin,
          icons: ["https://i.imgur.com/8Km9tLL.png"]
        }
      });
      
      await wcProvider.connect();
      
      let accounts = null;
      let retries = 0;
      
      while (!accounts && retries < 5) {
        try {
          accounts = await wcProvider.request({ method: "eth_accounts" });
          if (!accounts || accounts.length === 0) {
            accounts = await wcProvider.request({ method: "eth_requestAccounts" });
          }
        } catch(e) {
          console.log("Retry attempt", retries + 1);
        }
        if (!accounts || accounts.length === 0) {
          await new Promise(r => setTimeout(r, 500));
          retries++;
        }
      }
      
      if (!accounts || accounts.length === 0) {
        accounts = await wcProvider.request({ method: "eth_requestAccounts" });
      }
      
      if (!accounts || accounts.length === 0) {
        throw new Error("Could not get accounts after multiple attempts");
      }
      
      userAccount = accounts[0];
      const ethersProvider = new ethers.providers.Web3Provider(wcProvider);
      const signer = ethersProvider.getSigner();
      tokenContract = new ethers.Contract(PVLT_TOKEN_ADDRESS, PVLT_ABI, signer);
      
      try { 
        decimals = await tokenContract.decimals();
      } catch(e) { 
        console.log("Using default decimals:", e);
      }
      
      provider = wcProvider;
      loadData();
      await refreshUI();
      
      wcProvider.on("accountsChanged", async (newAcc) => {
        if (newAcc && newAcc.length > 0) {
          saveData();
          userAccount = newAcc[0];
          loadData();
          await refreshUI();
        }
      });
      
      wcProvider.on("disconnect", async () => {
        await disconnect();
      });
      
    } catch(e) {
      console.error("Connection error:", e);
      alert("Connection failed: " + (e.message || "Unknown error"));
      await disconnect();
    } finally {
      isLoading = false;
      connectBtn.disabled = false;
      if (!userAccount) {
        connectBtn.innerHTML = "🔌 CONNECT WALLET (POLYGON)";
      }
    }
  }

  // Event Listeners
  connectBtn.onclick = async () => {
    if (userAccount) {
      await disconnect();
    } else {
      await connect();
    }
  };

  tapCircle.onclick = (e) => {
    let x = e.clientX, y = e.clientY;
    if (!x || !y) {
      const rect = tapCircle.getBoundingClientRect();
      x = rect.left + rect.width/2;
      y = rect.top + rect.height/2;
    }
    handleTap(x, y);
  };
  
  tapCircle.ontouchstart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) handleTap(touch.clientX, touch.clientY);
  };
  
  buyBtn.onclick = () => buyEnergy();
  claimBtn.onclick = () => claimToWallet();
  
  document.getElementById("treasuryNote").onclick = () => {
    navigator.clipboard.writeText(PVLT_TOKEN_ADDRESS);
    statusBar.innerHTML = "📋 Contract address copied!";
    setTimeout(() => refreshUI(), 2000);
  };
  
  // Energy regeneration every second
  setInterval(() => {
    if (userAccount) {
      regenEnergy();
      refreshUI();
    }
  }, 1000);
  
  refreshUI();
  console.log("🎮 PepeVolt Game Ready! Economy: 100 taps = 1 PVLT, Max energy: 50");
</script>
</body>
</html>