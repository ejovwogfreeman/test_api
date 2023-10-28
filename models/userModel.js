const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    referralId: {
      type: String,
      required: false,
    },
    referrals: {
      type: Number,
      default: 0,
    },
    username: {
      type: String,
      requied: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      requied: true,
    },
    phoneNum: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    usdt: {
      type: Number,
      default: 0,
    },
    usd: {
      type: Number,
      default: 0,
    },
    btc: {
      type: Number,
      default: 0,
    },
    eth: {
      type: Number,
      default: 0,
    },
    cny: {
      type: Number,
      default: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      requied: false,
    },
    tradeIsOpen: {
      type: Boolean,
      default: false,
    },
    profileImage: [Object],
    verify: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Verify",
      },
    ],
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    investments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Investment",
      },
    ],
    deposits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "deposit",
      },
    ],
    trades: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "trade",
      },
    ],
    exchanges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exchange",
      },
    ],
    withdrawal: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "withdrawal",
      },
    ],
    mail: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Email",
      },
    ],
    support: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Support",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);

// If you're consistently encountering a duplicate key error for the email field despite not having the unique: true property set, there could be several reasons for this behavior. Here are some potential causes to consider:
// Existing Data: Check if you have any existing documents in your collection where the email field is already set to an empty string or null. If you have existing data that violates the uniqueness constraint (due to an empty email field), this could trigger a duplicate key error.
// Database State: Confirm that the index settings in your database match your current
