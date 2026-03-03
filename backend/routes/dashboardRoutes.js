const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Investor = require("../models/Investor");

// helper number
const n = (v) => Number(v || 0);

// months between two dates
const monthsBetween = (start, end) => {
  const ms = end - start;
  const days = ms / 86400000;
  return Math.max(0, Math.floor(days / 30));
};

router.get("/summary", async (req, res) => {
  try {
    const txns = await Transaction.find().lean();
    const investors = await Investor.find().lean();

    let totalGiven = 0;
    let totalTaken = 0;
    let totalInterest = 0;

    for (const t of txns) {
      const amount = n(t.amount);
      const interest = n(t.interestAmount);

      if (t.type === "Given") totalGiven += amount;
      if (t.type === "Taken") totalTaken += amount;

      totalInterest += interest;
    }

    const availableAmount = totalTaken - totalGiven;

    // ✅ Investor Performance: calculate payable returns (simple demo but real)
    const now = new Date();
    const investorRows = investors.map((inv) => {
      const m = monthsBetween(new Date(inv.startDate), now);
      const payable = (n(inv.investedAmount) * n(inv.monthlyReturnRate) * m) / 100;
      return {
        id: inv._id,
        name: inv.name,
        months: m,
        rate: inv.monthlyReturnRate,
        payable: Math.round(payable)
      };
    });

    // ✅ Payments Due: demo logic based on Given> Taken (you can improve later)
    // here we just return a count from cashflow difference
    const paymentsDueCount = Math.max(0, Math.min(25, Math.floor((totalGiven - totalTaken) / 5000)));

    res.json({
      availableAmount,
      totalGiven,
      totalTaken,
      totalInterest,
      paymentsDueCount,
      investorsCount: investors.length,
      investorRows
    });
  } catch (err) {
    console.log("Dashboard summary error:", err);
    res.status(500).json({ message: "Dashboard summary failed" });
  }
});

module.exports = router;
