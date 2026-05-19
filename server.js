/* ================= CLAIM PVLTG ================= */
app.post("/claim-pvltg", async(req, res)=>{
    try{
        const { wallet: userWallet } = req.body;
        const user = users[userWallet];

        if(!user){ return res.json({ error:"User not found" }); }
        
        // 10 PVLTG minimum required to trigger claim
        if(user.pvltg < 10){ return res.json({ error:"Need minimum 10 PVLTG" }); }

        // Calculation: 10 PVLTG = 1 PVLT. 
        // Calculate the raw target amount of PVLT the user gets.
        const pvltAmountToPayout = user.pvltg / 10; 
        const amountInWei = ethers.utils.parseEther(pvltAmountToPayout.toString());

        console.log(`Processing payout for ${userWallet}. Swapping ${user.pvltg} PVLTG for ${pvltAmountToPayout} PVLT`);

        /* OPTION A: If your GameEngine contract has a function to distribute PVLT 
           directly to a user address when called by the owner:
        */
        // const tx = await gameEngine.swapPVLTGtoPVLT(userWallet, amountInWei);
        // await tx.wait();

        /* OPTION B: If you want your backend server wallet to send PVLT 
           directly from its own token balance to the user:
        */
        // const pvltContract = new ethers.Contract(process.env.PVLT_ADDRESS, ["function transfer(address to, uint256 amount) external returns (bool)"], wallet);
        // const tx = await pvltContract.transfer(userWallet, amountInWei);
        // await tx.wait();

        // Clear user database balance after successful blockchain transaction confirmation
        user.pvltg = 0;
        res.json({ success: true, tx: tx.hash });

    }catch(err){
        console.error("CRITICAL ERROR DURING CLAIM ATTEMPT:", err);
        res.json({ error: "Claim processing failed on-chain: " + (err.reason || err.message) });
    }
});
