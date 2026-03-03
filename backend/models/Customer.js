const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // ✅ ensure name always exists
      trim: true
    },

    phone: {
      type: String,
      trim: true,
      default: "" // ✅ so draft can store empty
    },

    address: {
      type: String,
      trim: true,
      default: "" // ✅ so draft can store empty
    },

    // ✅ NEW: draft / active status
    status: {
      type: String,
      enum: ["draft", "active"],
      default: "active"
    },

    // ✅ keep your original createdAt logic
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    // ✅ keep same as your file (no timestamps)
    timestamps: false
  }
);

module.exports = mongoose.model("Customer", customerSchema);
