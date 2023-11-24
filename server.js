const express = require("express");
require("dotenv").config();
const app = express();
const userRoutes = require("./routes/userRoutes");
const supportRoutes = require("./routes/supportRoutes");
const connectDB = require("./config/db");
const User = require("./models/userModel");
const Transaction = require("./models/transactionModel");
const Deposit = require("./models/depositModel");
const Investment = require("./models/investmentModel");
const Email = require("./models/emailModel");
const cors = require("cors");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");
const https = require("https");

const key = fs.readFileSync("private.key");
const cert = fs.readFileSync("certificate.crt");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

let gfs, gridfsBucket;
const conn = mongoose.connection;

const port = process.env.PORT || 5000;
connectDB();

conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "photos",
  });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("photos");
});

app.use(cors(corsOptions));

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);

/* app.get(
  "/.well-known/pki-validation/BF46E86686E794DA52DFB5E968D5F016.txt",
  (req, res) => {
    res.sendFile(
      "C:\\Users\\Admin\\Desktop\\awsec2\\BF46E86686E794DA52DFB5E968D5F016.txt"
    );
  }
);
 */

const cred = {
  key,
  cert,
};

app.get("/file/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    const readStream = gridfsBucket.openDownloadStream(file._id);
    readStream.pipe(res);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.use("/api/users", userRoutes);
app.use("/api/support", supportRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to financial freedom investment");
});

const func = async () => {
  await Email.find().then((data) => console.log(data));
};

app.listen(port, () => {
  console.log(`server started at port ${port}`);
});

const httpssever = https.createServer(cred, app);
httpssever.listen(8443);
