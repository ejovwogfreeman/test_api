const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      username: String,
      email: String,
    },
    amount: {
      type: Number,
      requied: true,
    },
    mode: {
      type: String,
      default: null,
      enum: ["usdt_trc20", "usdt_erc", "btc"],
    },
    proof: [Object],
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

module.exports = mongoose.model("Deposit", depositSchema);
