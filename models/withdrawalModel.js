const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
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
      enum: ["usdt", "btc"],
    },
    accountDetails: {
      type: String,
      requied: true,
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

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
