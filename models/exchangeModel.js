const mongoose = require("mongoose");

const exchangeSchema = new mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      username: String,
      email: String,
    },
    sourceCurrency: {
      type: String,
      requied: true,
    },
    targetCurrency: {
      type: String,
      requied: true,
    },
    amount: {
      type: Number,
      requied: true,
    },
    value: {
      type: String,
      requied: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exchange", exchangeSchema);
