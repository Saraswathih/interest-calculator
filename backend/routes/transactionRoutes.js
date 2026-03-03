const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// ✅ Add transaction (Customer OR Investor)
router.post("/add", async (req, res) => {
  try {
    const { customerId, investorId, type, startDate } = req.body;

    const amount = parseFloat(req.body.amount);
    const interestRate = parseFloat(req.body.interestRate);
    const durationMonths = parseInt(req.body.durationMonths);

    if (!customerId && !investorId) {
      return res.status(400).json({ message: "Customer or Investor is required" });
    }

    if (!type || (type !== "Given" && type !== "Taken")) {
      return res.status(400).json({ message: "Type must be Given or Taken" });
    }

    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Amount must be a valid number" });
    }

    if (Number.isNaN(interestRate) || interestRate < 0) {
      return res.status(400).json({ message: "Interest rate must be valid" });
    }

    if (Number.isNaN(durationMonths) || durationMonths < 0) {
      return res.status(400).json({ message: "Duration must be valid" });
    }

    if (!startDate) {
      return res.status(400).json({ message: "Start date is required" });
    }

    // ✅ Simple Interest calculation
    const interest = (amount * interestRate * durationMonths) / 1200;
    const total = amount + interest;

    const transaction = new Transaction({
      customerId: customerId || undefined,
      investorId: investorId || undefined,
      type,
      startDate,
      amount,
      interestRate,
      durationMonths,
      interestAmount: interest,
      totalAmount: total
    });

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error("Error saving transaction:", error);
    res.status(500).json({ message: error.message || "Failed to add transaction" });
  }
});

// ✅ Get transactions
router.get("/", async (req, res) => {
  try {
    const { customerId, investorId } = req.query;

    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (investorId) filter.investorId = investorId;

    const data = await Transaction.find(filter)
      .populate("customerId", "name")
      .populate("investorId", "name")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: error.message || "Failed to fetch transactions" });
  }
});

/**
 * ✅ ONE correct summary endpoint (internship-ready)
 * - totalGiven: total money given out (loan outflow)
 * - totalTaken: total money received back (inflow)
 * - cashAvailable: totalTaken - totalGiven
 * - receivableOutstanding: totalGiven - totalTaken
 * - totalInterest: sum of interestAmount
 */
router.get("/summary", async (req, res) => {
  try {
    const txns = await Transaction.find().lean();

    let totalGiven = 0;
    let totalTaken = 0;
    let totalInterest = 0;

    for (const t of txns) {
      const amount = Number(t.amount || 0);
      const interest = Number(t.interestAmount || 0);

      if (t.type === "Given") totalGiven += amount;
      if (t.type === "Taken") totalTaken += amount;

      totalInterest += interest;
    }

    const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

    const cashAvailable = totalTaken - totalGiven;
    const receivableOutstanding = totalGiven - totalTaken;

    res.json({
      totalGiven: round2(totalGiven),
      totalTaken: round2(totalTaken),
      cashAvailable: round2(cashAvailable),
      receivableOutstanding: round2(receivableOutstanding),
      totalInterest: round2(totalInterest)
    });
  } catch (err) {
    console.log("Summary error:", err);
    res.status(500).json({ message: "Summary fetch failed" });
  }
});

module.exports = router;
