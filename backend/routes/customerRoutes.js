console.log("🔥 customerRoutes.js LOADED 🔥");

const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// ✅ TEST route (to confirm this file is loading)
router.get("/ping", (req, res) => {
  res.json({ ok: true, msg: "customerRoutes.js is working ✅" });
});

// ✅ Add customer (active or draft)
router.post("/add", async (req, res) => {
  try {
    const { name, phone, address, status } = req.body;

    const finalStatus = status === "draft" ? "draft" : "active";

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Customer name is required" });
    }

    if (finalStatus === "active") {
      if (!phone || phone.trim() === "") {
        return res.status(400).json({ message: "Phone number is required" });
      }
      if (!address || address.trim() === "") {
        return res.status(400).json({ message: "Address is required" });
      }
    }

    const customer = new Customer({
      name: name.trim(),
      phone: (phone || "").trim(),
      address: (address || "").trim(),
      status: finalStatus
    });

    await customer.save();
    res.json(customer);
  } catch (error) {
    console.error("Add customer error:", error);
    res.status(500).json({ message: "Failed to add customer" });
  }
});

// ✅ Get ALL customers (draft + active)
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error("Fetch customers error:", error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// ✅ Get ONLY draft customers
router.get("/drafts", async (req, res) => {
  try {
    const drafts = await Customer.find({ status: "draft" }).sort({
      createdAt: -1
    });
    res.json(drafts);
  } catch (error) {
    console.error("Fetch drafts error:", error);
    res.status(500).json({ message: "Failed to fetch draft customers" });
  }
});

// ✅ Get ONLY active customers
router.get("/active", async (req, res) => {
  try {
    const activeCustomers = await Customer.find({ status: "active" }).sort({
      createdAt: -1
    });
    res.json(activeCustomers);
  } catch (error) {
    console.error("Fetch active customers error:", error);
    res.status(500).json({ message: "Failed to fetch active customers" });
  }
});

// ✅ ✅ DELETE customer by ID (draft or active)
// DELETE /api/customers/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.json({
      message: "Customer deleted successfully ✅",
      id: deleted._id
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    return res.status(500).json({ message: "Failed to delete customer" });
  }
});

module.exports = router;
