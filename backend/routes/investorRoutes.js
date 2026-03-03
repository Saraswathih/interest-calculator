const express = require("express");
const router = express.Router();
const Investor = require("../models/Investor");

// ✅ ping
router.get("/ping", (req, res) => res.json({ ok: true, msg: "investorRoutes ✅" }));

// ✅ add investor
router.post("/add", async (req, res) => {
  try {
    const { name, phone, address, investedAmount, monthlyReturnRate, startDate } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "Investor name is required" });
    if (!phone?.trim()) return res.status(400).json({ message: "Phone number is required" });
    if (!address?.trim()) return res.status(400).json({ message: "Address is required" });

    if (investedAmount === "" || investedAmount === undefined) {
      return res.status(400).json({ message: "Invested amount is required" });
    }
    if (monthlyReturnRate === "" || monthlyReturnRate === undefined) {
      return res.status(400).json({ message: "Monthly return rate is required" });
    }
    if (!startDate) return res.status(400).json({ message: "Start date is required" });

    const investor = new Investor({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      investedAmount: Number(investedAmount),
      monthlyReturnRate: Number(monthlyReturnRate),
      startDate
    });

    await investor.save();
    res.json(investor);
  } catch (err) {
    console.error("Add investor error:", err);
    res.status(500).json({ message: "Failed to add investor" });
  }
});

// ✅ get all investors
router.get("/", async (req, res) => {
  try {
    const investors = await Investor.find().sort({ createdAt: -1 });
    res.json(investors);
  } catch (err) {
    console.error("Fetch investors error:", err);
    res.status(500).json({ message: "Failed to fetch investors" });
  }
});

// ✅ get investor by id
router.get("/:id", async (req, res) => {
  try {
    const investor = await Investor.findById(req.params.id);
    if (!investor) return res.status(404).json({ message: "Investor not found" });
    res.json(investor);
  } catch (err) {
    console.error("Fetch investor by id error:", err);
    res.status(400).json({ message: "Invalid investor id" });
  }
});

// ✅ NEW: update investor (for Edit page)
router.put("/:id", async (req, res) => {
  try {
    const { name, phone, address, investedAmount, monthlyReturnRate, startDate, status } = req.body;

    const updated = await Investor.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
        ...(address !== undefined ? { address: String(address).trim() } : {}),
        ...(investedAmount !== undefined ? { investedAmount: Number(investedAmount) } : {}),
        ...(monthlyReturnRate !== undefined ? { monthlyReturnRate: Number(monthlyReturnRate) } : {}),
        ...(startDate !== undefined ? { startDate } : {}),
        ...(status !== undefined ? { status } : {})
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Investor not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update investor error:", err);
    res.status(400).json({ message: "Failed to update investor" });
  }
});

// ✅ delete investor
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Investor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Investor not found" });
    res.json({ message: "Investor deleted ✅", id: deleted._id });
  } catch (err) {
    console.error("Delete investor error:", err);
    res.status(400).json({ message: "Invalid investor id" });
  }
});

module.exports = router;
