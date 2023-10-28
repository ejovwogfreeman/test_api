const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      username: String,
      email: String,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
    },
    type: {
      type: String,
      requied: true,
      enum: ["withdrawal", "deposit", "investment", "trade", "exchange"],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "processing", "confirmed", "failed", "declined"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
