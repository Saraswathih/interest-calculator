const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  // Customer Transactions (optional)
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: false
  },

  // Investor Transactions (optional)
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Investor",
    required: false
  },

  type: {
    type: String,
    enum: ["Given", "Taken"],
    default: "Given",
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },

  interestRate: {
    type: Number,
    required: true,
    min: 0
  },

  durationMonths: {
    type: Number,
    required: true,
    min: 0
  },

  startDate: {
    type: Date,
    required: true
  },

  interestAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});



module.exports = mongoose.model("Transaction", transactionSchema);
