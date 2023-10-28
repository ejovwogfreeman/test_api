const mongoose = require("mongoose");

const verifySchema = new mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      username: String,
      email: String,
    },
    verifiedDoc: {
      type: String,
      requied: false,
    },
    verifiedPic: [Object],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Verify", verifySchema);
