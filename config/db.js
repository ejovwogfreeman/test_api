const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongo db conneted`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
