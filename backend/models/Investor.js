const mongoose = require("mongoose");

const investorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    investedAmount: { type: Number, required: true },
    monthlyReturnRate: { type: Number, required: true }, // % per month
    startDate: { type: Date, required: true },

    status: { type: String, enum: ["active", "closed"], default: "active" },

    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

module.exports = mongoose.model("Investor", investorSchema);
