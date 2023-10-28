const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Investment = require("../models/investmentModel");
const Transaction = require("../models/transactionModel");
const Trade = require("../models/tradeModel");
const Exchange = require("../models/exchangeModel");
const Deposit = require("../models/depositModel");
const Withdrawal = require("../models/withdrawalModel");
const Verify = require("../models/verifyModel");
const refCode = require("voucher-code-generator");
const sendEmail = require("../helpers/email");
const cron = require("node-cron");
// const mongoose = require("mongoose");

///////////////////////////
///////register user///////
///////////////////////////

const registerUser = async (req, res) => {
  try {
    const { referral, username, email, phoneNum, password } = req.body;

    if (referral) {
      const referredUser = await User.findOne({ referralId: referral });
      if (referredUser) {
        const referralCount = (referredUser.referrals ?? 0) + 1; // Use 0 as the default value if referrals is null or undefined
        await User.findOneAndUpdate(
          { referralId: referral },
          { referrals: referralCount }
        );
      } else {
        console.log("Referred user not found");
      }
    }

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Please add all fields", error: true });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists", error: true });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const referralId = refCode.generate({ length: 5 }).toString();

    const user = new User({
      referralId,
      username,
      email,
      phoneNum,
      password: hashedPassword,
    });

    await user.save();

    if (user) {
      const { password, ...others } = user.toObject();
      await sendEmail(email, "Welcome On Board", "register.html");
      return res.status(200).json({
        ...others,
        token: accessToken(user),
      });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send(error.message);
  }
};

/////////////////////////////
/////////LOGIN USER//////////
/////////////////////////////

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      res.status(400).json({ message: "please fill all fields" });
    } else {
      const user = await User.findOne({ username });
      if (user) {
        const hashedPassword = user.password;
        const comparedPassword = await bcrypt.compare(password, hashedPassword);
        if (comparedPassword === true) {
          const { password, ...others } = user._doc;

          res.status(200).json({
            ...others,
            token: accessToken(user),
          });
        } else {
          res.status(400).json({ message: "passwords do not match" });
        }
      } else {
        res.status(400).json({ message: "User not found" });
      }
    }
  } catch (err) {
    res.status(400).json(err);
  }
};

///////////////////////////
///////get one user////////
///////////////////////////

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { _id, __v, ...others } = user.toObject();
    res.send({
      ...others,
      token: accessToken(user),
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//////////////////////////
///////generate jwt///////
//////////////////////////

// assess token for particular user and admin functionality
const accessToken = (user) => {
  return jwt.sign(
    {
      user,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

/////////////////////////
////////update user//////
/////////////////////////

const updateUser = async (req, res) => {
  // destructuring the email and password from the object
  const { oldPassword, password, name, address, username, email, phoneNum } =
    req.body;

  if (password && oldPassword) {
    const user = await User.findById(req.user._id);

    // compare the password and send
    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedpassword = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(req.user._id, { password: hashedpassword });
      res.status(200).json({ message: "Password Changed Successfully" });
    } else {
      res
        .status(400)
        .json({ message: "Old Password is not correct", error: true });
    }
  }

  if (req.files && req.files.length > 0) {
    let filesArray = [];
    req.files.forEach((element) => {
      const file = {
        fileName: element.originalname,
        fileType: element.mimetype,
        link: `file/${element.filename}`,
      };
      filesArray.push(file);
    });
    await User.findByIdAndUpdate(req.user._id, { profileImage: filesArray });
  }

  if (name && name !== "null") {
    await User.findByIdAndUpdate(req.user._id, { name: name });
  }
  if (address && address !== "null") {
    await User.findByIdAndUpdate(req.user._id, { address: address });
  }

  if (username && username !== "null") {
    await User.findByIdAndUpdate(req.user._id, { username: username });
  }

  if (email && email !== "null") {
    await User.findByIdAndUpdate(req.user._id, { email: email });
  }

  if (phoneNum && phoneNum !== "null") {
    await User.findByIdAndUpdate(req.user._id, { phoneNum: phoneNum });
  }

  res.status(200).json({ message: "Profile Updated Successfully" });
};

/////////////////////////////////////////
//////////get single transaction/////////
/////////////////////////////////////////

const getTransaction = async (req, res) => {
  // res.status(200).json(req.user);
  const transaction = await Transaction.find();
  let usertrx = transaction.filter((trx) => {
    return trx.user.email === req.user.email;
  });
  res.status(200).send(usertrx);
};

/////////////////////////////////////////
//////////get single transaction/////////
/////////////////////////////////////////

const getTrade = async (req, res) => {
  const trade = await Trade.find();
  let usertrade = trade.filter((trade) => {
    return trade.user.email === req.user.email;
  });
  res.status(200).send(usertrade);
};
/////////////////////////////////////////
//////////get single exchange////////////
/////////////////////////////////////////

const getExchange = async (req, res) => {
  const exchange = await Exchange.find();
  let userexchange = exchange.filter((exchange) => {
    return exchange.user.email === req.user.email;
  });
  res.status(200).send(userexchange);
};

/////////////////////////////////////////
//////////get single investment/////////
/////////////////////////////////////////

const getInvestment = async (req, res) => {
  const investment = await Investment.find();
  let userinv = investment.filter((trx) => {
    return trx.user.email === req.user.email;
  });
  res.status(200).send(userinv);
};

/////////////////////////////////////////
//////////get single deposit/////////
/////////////////////////////////////////

const getDeposit = async (req, res) => {
  // res.status(200).json(req.user);
  const deposit = await Deposit.find();
  let userdep = deposit.filter((trx) => {
    return trx.user.email === req.user.email;
  });
  res.status(200).send(userdep);
};

/////////////////////////////////////////
//////////get single withdrawal/////////
/////////////////////////////////////////

const getWithdrawal = async (req, res) => {
  // res.status(200).json(req.user);
  const withdrawal = await Withdrawal.find();
  let userinv = withdrawal.filter((trx) => {
    return trx.user.email === req.user.email;
  });
  res.status(200).send(userinv);
};

/////////////////////////////
//////////Investment/////////
/////////////////////////////

// const userInvest = async (req, res) => {
//   let { amount, plan } = req.body;
//   const { email, username, _id } = req.user;
//   amount = Number(amount);

//   if (!amount)
//     return res
//       .status(400)
//       .json({ message: "Amount must not be left empty", error: true });
//   if (plan.toLowerCase().includes("Lock Up Mining O1")) {
//     if (amount < 2000) {
//       return res.status(400).json({
//         message: "The amount is smaller than the selected plan.",
//         error: true,
//       });
//     }
//     if (amount > 99999999) {
//       return res.status(400).json({
//         message: "The amount is larger than the selected plan.",
//         error: true,
//       });
//     }
//   }

//   if (plan.toLowerCase().includes("Lock Up Mining O2")) {
//     if (amount < 5000) {
//       return res.status(400).json({
//         message: "The amount is smaller than the selected plan.",
//         error: true,
//       });
//     }
//     if (amount > 99999999) {
//       return res.status(400).json({
//         message: "The amount is larger than the selected plan.",
//         error: true,
//       });
//     }
//   }

//   if (plan.toLowerCase().includes("Lock Up Mining O3")) {
//     if (amount < 20000) {
//       return res.status(400).json({
//         message: "The amount is smaller than the selected plan.",
//         error: true,
//       });
//     }
//     if (amount > 99999999) {
//       return res.status(400).json({
//         message: "The amount is larger than the selected plan.",
//         error: true,
//       });
//     }
//   }
//   if (plan.toLowerCase().includes("Lock Up Mining O4")) {
//     if (amount < 100000) {
//       return res.status(400).json({
//         message: "The amount is smaller than the selected plan.",
//         error: true,
//       });
//     }
//     if (amount > 99999999) {
//       return res.status(400).json({
//         message: "The amount is larger than the selected plan.",
//         error: true,
//       });
//     }
//   }

//   if (plan.toLowerCase().includes("Lock Up Mining O5")) {
//     if (amount < 1000000) {
//       return res.status(400).json({
//         message: "The amount is smaller than the selected plan.",
//         error: true,
//       });
//     }
//     if (amount > 99999999) {
//       return res.status(400).json({
//         message: "The amount is larger than the selected plan.",
//         error: true,
//       });
//     }
//   }

//   let user = await User.findById(_id);
//   let usdt = user.usdt;
//   if (amount > usdt || usdt === 0)
//     return res.status(400).json({
//       message: "You don't have sufficient balance to make this investment",
//       error: true,
//     });

//   const investOptions = {
//     amount: amount,
//     plan: plan,
//   };

//   const transactionOptions = {
//     type: "investment",
//     status: "pending",
//   };

//   let transactionId;
//   let investmentId;

//   try {
//     const investment = await Investment.create(investOptions);
//     investmentId = investment.id;
//     investment.user.id = _id;
//     investment.user.email = email;
//     investment.user.username = username;
//     await investment.save();

//     const transaction = await Transaction.create(transactionOptions);
//     transactionId = transaction.id;
//     transaction.transaction = investment.id;
//     transaction.user.id = _id;
//     transaction.user.email = email;
//     transaction.user.username = username;
//     await transaction.save();

//     const user = await User.findById(_id);
//     user.usdt = user.usdt - amount;
//     user.investments.push(investmentId);
//     user.transactions.push(transactionId);
//     await user.save();
//   } catch (err) {
//     return res.status(400).json(err);
//   }

//   res.status(200).json({ message: "Investment Added Successfully" });
// };

cron.schedule("0 0 * * *", async () => {
  try {
    const investments = await Investment.find({ status: "pending" });

    for (const investment of investments) {
      const daysPassed = Math.floor(
        (Date.now() - investment.createdAt) / (24 * 60 * 60 * 1000)
      );
      if (daysPassed >= investment.plan.days) {
        const earnedProfit =
          investment.amount *
          investment.plan.dailyProfit *
          investment.plan.days;

        const user = await User.findById(investment.user.id);
        user.usdt += earnedProfit;
        user.profit += earnedProfit;
        investment.status = "confirmed";

        await Promise.all([user.save(), investment.save()]);
      }
    }
  } catch (error) {
    console.error("Error in scheduled task:", error);
  }
});

const userInvest = async (req, res) => {
  const { amount, plan } = req.body;
  const { email, username, _id } = req.user;

  if (!amount) {
    return res.status(400).json({
      message: "Amount must not be left empty",
      error: true,
    });
  }

  const selectedPlan = plan;
  // Plan details mapping
  const planDetails = {
    "Lock Up Mining 01": {
      minAmount: 2000,
      dailyProfit: 0.007,
      expectedProfit: amount * 5 * 0.007,
      days: 5,
      limit: "2000 ~ 99999999",
      ror: "0.5 ~ 0.7%",
      percent: 8.3,
    },
    "Lock Up Mining 02": {
      minAmount: 5000,
      dailyProfit: 0.0125,
      expectedProfit: amount * 15 * 0.0125,
      days: 15,
      limit: "5000 ~ 99999999",
      ror: "1 ~ 1.25%",
      percent: 9.1,
    },
    "Lock Up Mining 03": {
      minAmount: 20000,
      dailyProfit: 0.015,
      expectedProfit: amount * 30 * 0.015,
      days: 30,
      limit: "20000 ~ 99999999",
      ror: "1.25 ~ 1.5%",
      percent: 17,
    },
    "Lock Up Mining 04": {
      minAmount: 100000,
      dailyProfit: 0.02,
      expectedProfit: amount * 60 * 0.02,
      days: 60,
      limit: "100000 ~ 99999999",
      ror: "1.25 ~ 2%",
      percent: 16.1,
    },
    "Lock Up Mining 05": {
      minAmount: 1000000,
      dailyProfit: 0.025,
      expectedProfit: amount * 90 * 0.025,
      days: 90,
      ror: "2 ~ 2.5%",
      period: "90(Days)",
      percent: 60,
    },
  };

  if (!planDetails[selectedPlan]) {
    return res.status(400).json({
      message: "Invalid plan selected",
      error: true,
    });
  }

  const { minAmount, dailyProfit, days } = planDetails[selectedPlan];

  if (amount < minAmount || amount > 99999999) {
    return res.status(400).json({
      message: "Invalid amount for the selected plan",
      error: true,
    });
  }

  const user = await User.findById(_id);
  const usdt = user.usdt;
  if (amount > usdt || usdt === 0) {
    return res.status(400).json({
      message: "Insufficient balance for investment",
      error: true,
    });
  }

  const investOptions = {
    amount: amount,
    status: "pending",
  };

  const transactionOptions = {
    type: "investment",
    status: "pending",
  };

  let transactionId;
  let investmentId;

  try {
    const investment = await Investment.create(investOptions);
    investmentId = investment.id;
    investment.plan.name = plan;
    investment.plan.dailyProfit = planDetails[plan].dailyProfit;
    investment.plan.expectedProfit = planDetails[plan].expectedProfit;
    investment.plan.days = planDetails[plan].days;
    investment.plan.limit = planDetails[plan].limit;
    investment.plan.ror = planDetails[plan].ror;
    investment.plan.percent = planDetails[plan].percent;
    investment.user.id = _id;
    investment.user.email = email;
    investment.user.username = username;
    await investment.save();

    const transaction = await Transaction.create(transactionOptions);
    transactionId = transaction.id;
    transaction.transaction = investment.id;
    transaction.user.id = _id;
    transaction.user.email = email;
    transaction.user.username = username;
    await transaction.save();

    user.usdt -= amount;
    user.investments.push(investmentId);
    user.transactions.push(transactionId);
    await user.save();
    await sendEmail(email, "Welcome On Board", "invest.html");
  } catch (err) {
    return res.status(400).json(err);
  }

  res.status(200).json({
    message: "Investment Added Successfully",
  });
};

/////////////////////////////
///////////Deposit///////////
/////////////////////////////

const userDeposit = async (req, res) => {
  // destructuring all information from the object
  const { amount, mode } = req.body;
  const { email, username, _id } = req.user;

  // validate inputs
  if (!amount || !mode) {
    return res.send({ message: "Please add all fields", error: true });
  }

  try {
    let filesArray = [];
    req.files.forEach((element) => {
      const file = {
        fileName: element.originalname,
        fileType: element.mimetype,
        link: `file/${element.filename}`,
      };
      filesArray.push(file);
    });

    const depositOptions = {
      amount,
      mode,
      proof: filesArray,
      status: "pending",
    };

    const transactionOptions = {
      type: "deposit",
      status: "pending",
    };

    let transactionId;
    let depositId;

    try {
      const deposit = await Deposit.create(depositOptions);
      depositId = deposit.id;
      deposit.user.id = _id;
      deposit.user.email = email;
      deposit.user.username = username;
      await deposit.save();

      const transaction = await Transaction.create(transactionOptions);
      transactionId = transaction.id;
      transaction.transaction = depositId;
      transaction.user.id = _id;
      transaction.user.email = email;
      transaction.user.username = username;
      await transaction.save();

      const user = await User.findById(_id);
      user.deposits.push(depositId);
      user.transactions.push(transactionId);
      await user.save();
      // await sendEmail(email, "Deposit", "deposit.html");
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }

    res.status(201).json({ message: "Files Uploaded Successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, error: true });
  }
};

/////////////////////////////
///////////Deposit///////////
/////////////////////////////

const userVerify = async (req, res) => {
  const { verifiedDoc } = req.body;
  const { email, username, _id } = req.user;

  if (!verifiedDoc) {
    return res.send({ message: "Please add all fields", error: true });
  }

  try {
    let filesArray = [];
    req.files.forEach((element) => {
      const file = {
        fileName: element.originalname,
        fileType: element.mimetype,
        link: `file/${element.filename}`,
      };
      filesArray.push(file);
    });

    const verifyOptions = {
      verifiedDoc,
      verifiedPic: filesArray,
      status: false,
    };

    let verifyId;

    try {
      const verify = await Verify.create(verifyOptions);
      verifyId = verify.id;
      verify.user.id = _id;
      verify.user.email = email;
      verify.user.username = username;
      verify.user.verified = true;
      await verify.save();

      const user = await User.findById(_id);
      user.verify.push(verifyId);
      await user.save();
    } catch (err) {
      return res.status(400).json(err);
    }

    res.status(201).json({ message: "Files Uploaded Successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, error: true });
  }
};

/////////////////////////////
///////////Withdraw//////////
/////////////////////////////

const userWithdraw = async (req, res) => {
  const { email, username, _id } = req.user;

  let user = await User.findById(_id);
  let { amount, address, mode } = req.body;
  amount = Number(amount);

  if (amount > user.usdt || user.usdt === 0) {
    return res
      .status(400)
      .json({ message: "You do not have sufficient balance.", error: true });
  }

  const withdrawOptions = {
    amount: amount,
    accountDetails: address,
    mode,
  };

  const transactionOptions = {
    type: "withdrawal",
    status: "pending",
  };

  try {
    const withdraw = await Withdrawal.create(withdrawOptions);
    withdrawId = withdraw.id;
    withdraw.user.id = _id;
    withdraw.user.email = email;
    withdraw.user.username = username;
    await withdraw.save();

    const transaction = await Transaction.create(transactionOptions);
    transactionId = transaction.id;
    transaction.transaction = withdraw.id;
    transaction.user.id = _id;
    transaction.user.email = email;
    transaction.user.username = username;
    await transaction.save();

    const user = await User.findById(_id);
    let withdraws = user.withdrawal;
    withdraws.push(withdrawId);
    user.withdrawal = withdraws;

    let transactions = user.transactions;
    transactions.push(transactionId);
    user.transactions = transactions;

    await user.save();
    await sendEmail(email, "Withdraw", "withdraw.html");

    res
      .status(200)
      .json({ message: "Withdrawal request created successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message, error: true });
  }
};

/////////////////////////////
///////////Trade/////////////
/////////////////////////////

const userTrade = async (req, res) => {
  try {
    // Destructuring all information from the request body
    const { amount, duration, gainOrLoss, tradeIsOpen } = req.body;
    const { email, username, _id } = req.user;

    // Validate inputs
    if (!amount || !duration || isNaN(amount) || isNaN(duration)) {
      return res
        .status(400)
        .json({ message: "Invalid input data", error: true });
    }

    let user = await User.findById(_id);

    let usdt = user.usdt;
    if (amount > usdt || usdt === 0)
      return res.status(400).json({
        message: "You don't have sufficient balance to trade",
        error: true,
      });

    // Create trade and transaction options
    const tradeOptions = {
      amount,
      duration,
      gainOrLoss,
    };

    const transactionOptions = {
      type: "trade",
      status: "confirmed",
    };

    let transactionId;
    let tradeId;

    try {
      const newTrade = await Trade.create(tradeOptions);
      tradeId = newTrade.id;
      newTrade.user.id = _id;
      newTrade.user.email = email;
      newTrade.user.username = username;
      newTrade.profit = gainOrLoss;
      await newTrade.save();

      const newTransaction = await Transaction.create(transactionOptions);
      transactionId = newTransaction.id;
      newTransaction.transaction = tradeId;
      newTransaction.user.id = _id;
      newTransaction.user.email = email;
      newTransaction.user.username = username;
      await newTransaction.save();

      const user = await User.findById(_id);
      user.trades.push(tradeId);
      user.usdt += gainOrLoss; // Update balance based on gain or loss
      user.transactions.push(transactionId);
      await user.save();

      res.status(201).json({ message: "Trade successful", data: { tradeId } });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Trade failed", error: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: true });
  }
};

////////////////////////////////////
////////////reset password//////////
////////////////////////////////////

// const userExchange = async (req, res) => {
//   try {
//     const { sourceCurrency, targetCurrency, amount, value } = req.body;
//     const { email, username, _id } = req.user;

//     if (!sourceCurrency || !targetCurrency || !amount || !value) {
//       return res
//         .status(400)
//         .json({ message: "Invalid input data", error: true });
//     }

//     let user = await User.findById(_id);

//     let usdt = user.balance;
//     if (
//       (sourceCurrency === "USDT" && usdt === 0) ||
//       (sourceCurrency === "USDT" && usdt < sourceCurrency)
//     ) {
//       res
//         .status(400)
//         .json({ message: "You do not have sufficient USDT", error: true });
//     } else {
//       const exchangeOptions = {
//         sourceCurrency,
//         targetCurrency,
//         amount,
//         value,
//       };

//       const transactionOptions = {
//         type: "exchange",
//         status: "confirmed",
//       };

//       let transactionId;
//       let exchangeId;

//       try {
//         const newExchange = await Exchange.create(exchangeOptions);
//         exchangeId = newExchange.id;
//         newExchange.user.id = _id;
//         newExchange.user.email = email;
//         newExchange.user.username = username;
//         await newExchange.save();

//         const newTransaction = await Transaction.create(transactionOptions);
//         transactionId = newTransaction.id;
//         newTransaction.transaction = exchangeId;
//         newTransaction.user.id = _id;
//         newTransaction.user.email = email;
//         newTransaction.user.username = username;
//         await newTransaction.save();

//         const user = await User.findById(_id);
//         user.exchanges.push(exchangeId);
//         user.balance -= value;
//         user.transactions.push(transactionId);
//         await user.save();

//         res
//           .status(201)
//           .json({ message: "Exchange successful", data: { exchangeId } });
//       } catch (err) {
//         console.error(err);
//         res.status(400).json({ message: "Exchange failed", error: true });
//       }
//     }
//     let usd = user.usd;
//     if (
//       (sourceCurrency === "USD" && usd === 0) ||
//       (sourceCurrency === "USD" && usd < sourceCurrency)
//     ) {
//       res
//         .status(400)
//         .json({ message: "You do not have sufficient USD", error: true });
//     } else {
//       const exchangeOptions = {
//         sourceCurrency,
//         targetCurrency,
//         amount,
//         value,
//       };

//       const transactionOptions = {
//         type: "exchange",
//         status: "confirmed",
//       };

//       let transactionId;
//       let exchangeId;

//       try {
//         const newExchange = await Exchange.create(exchangeOptions);
//         exchangeId = newExchange.id;
//         newExchange.user.id = _id;
//         newExchange.user.email = email;
//         newExchange.user.username = username;
//         await newExchange.save();

//         const newTransaction = await Transaction.create(transactionOptions);
//         transactionId = newTransaction.id;
//         newTransaction.transaction = exchangeId;
//         newTransaction.user.id = _id;
//         newTransaction.user.email = email;
//         newTransaction.user.username = username;
//         await newTransaction.save();

//         const user = await User.findById(_id);
//         user.exchanges.push(exchangeId);
//         user.usd -= value;
//         user.transactions.push(transactionId);
//         await user.save();

//         res
//           .status(201)
//           .json({ message: "Exchange successful", data: { exchangeId } });
//       } catch (err) {
//         console.error(err);
//         res.status(400).json({ message: "Exchange failed", error: true });
//       }
//     }
//     let eth = user.eth;
//     if (
//       (sourceCurrency === "ETH" && eth === 0) ||
//       (sourceCurrency === "ETH" && eth < sourceCurrency)
//     ) {
//       res
//         .status(400)
//         .json({ message: "You do not have sufficient ETH", error: true });
//     } else {
//       const exchangeOptions = {
//         sourceCurrency,
//         targetCurrency,
//         amount,
//         value,
//       };

//       const transactionOptions = {
//         type: "exchange",
//         status: "confirmed",
//       };

//       let transactionId;
//       let exchangeId;

//       try {
//         const newExchange = await Exchange.create(exchangeOptions);
//         exchangeId = newExchange.id;
//         newExchange.user.id = _id;
//         newExchange.user.email = email;
//         newExchange.user.username = username;
//         await newExchange.save();

//         const newTransaction = await Transaction.create(transactionOptions);
//         transactionId = newTransaction.id;
//         newTransaction.transaction = exchangeId;
//         newTransaction.user.id = _id;
//         newTransaction.user.email = email;
//         newTransaction.user.username = username;
//         await newTransaction.save();

//         const user = await User.findById(_id);
//         user.exchanges.push(exchangeId);
//         user.eth -= value;
//         user.transactions.push(transactionId);
//         await user.save();

//         res
//           .status(201)
//           .json({ message: "Exchange successful", data: { exchangeId } });
//       } catch (err) {
//         console.error(err);
//         res.status(400).json({ message: "Exchange failed", error: true });
//       }
//     }
//     let btc = user.btc;
//     if (
//       (sourceCurrency === "BTC" && btc === 0) ||
//       (sourceCurrency === "BTC" && btc < sourceCurrency)
//     ) {
//       res
//         .status(400)
//         .json({ message: "You do not have sufficient BTC", error: true });
//     } else {
//       const exchangeOptions = {
//         sourceCurrency,
//         targetCurrency,
//         amount,
//         value,
//       };

//       const transactionOptions = {
//         type: "exchange",
//         status: "confirmed",
//       };

//       let transactionId;
//       let exchangeId;

//       try {
//         const newExchange = await Exchange.create(exchangeOptions);
//         exchangeId = newExchange.id;
//         newExchange.user.id = _id;
//         newExchange.user.email = email;
//         newExchange.user.username = username;
//         await newExchange.save();

//         const newTransaction = await Transaction.create(transactionOptions);
//         transactionId = newTransaction.id;
//         newTransaction.transaction = exchangeId;
//         newTransaction.user.id = _id;
//         newTransaction.user.email = email;
//         newTransaction.user.username = username;
//         await newTransaction.save();

//         const user = await User.findById(_id);
//         user.exchanges.push(exchangeId);
//         user.btc -= value;
//         user.transactions.push(transactionId);
//         await user.save();

//         res
//           .status(201)
//           .json({ message: "Exchange successful", data: { exchangeId } });
//       } catch (err) {
//         console.error(err);
//         res.status(400).json({ message: "Exchange failed", error: true });
//       }
//     }
//     let cny = user.cny;
//     if (
//       (sourceCurrency === "CNY" && cny === 0) ||
//       (sourceCurrency === "CNY" && cny < sourceCurrency)
//     ) {
//       res
//         .status(400)
//         .json({ message: "You do not have sufficient CNY", error: true });
//     } else {
//       const exchangeOptions = {
//         sourceCurrency,
//         targetCurrency,
//         amount,
//         value,
//       };

//       const transactionOptions = {
//         type: "exchange",
//         status: "confirmed",
//       };

//       let transactionId;
//       let exchangeId;

//       try {
//         const newExchange = await Exchange.create(exchangeOptions);
//         exchangeId = newExchange.id;
//         newExchange.user.id = _id;
//         newExchange.user.email = email;
//         newExchange.user.username = username;
//         await newExchange.save();

//         const newTransaction = await Transaction.create(transactionOptions);
//         transactionId = newTransaction.id;
//         newTransaction.transaction = exchangeId;
//         newTransaction.user.id = _id;
//         newTransaction.user.email = email;
//         newTransaction.user.username = username;
//         await newTransaction.save();

//         const user = await User.findById(_id);
//         user.exchanges.push(exchangeId);
//         user.cny -= value;
//         user.transactions.push(transactionId);
//         await user.save();

//         res
//           .status(201)
//           .json({ message: "Exchange successful", data: { exchangeId } });
//       } catch (err) {
//         console.error(err);
//         res.status(400).json({ message: "Exchange failed", error: true });
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error", error: true });
//   }
// };

const userExchange = async (req, res) => {
  try {
    const { sourceCurrency, targetCurrency, amount, value } = req.body;
    const { email, username, _id } = req.user;

    if (!sourceCurrency || !targetCurrency || !amount || !value) {
      return res
        .status(400)
        .json({ message: "Invalid input data", error: true });
    }

    let user = await User.findById(_id);

    let currencyBalance = user[sourceCurrency.toLowerCase()];
    if (currencyBalance === 0 || currencyBalance < amount) {
      res.status(400).json({
        message: `You do not have sufficient ${sourceCurrency}`,
        error: true,
      });
    } else {
      const exchangeOptions = {
        sourceCurrency,
        targetCurrency,
        amount,
        value,
      };

      const transactionOptions = {
        type: "exchange",
        status: "pending",
      };

      let transactionId;
      let exchangeId;

      try {
        const newExchange = await Exchange.create(exchangeOptions);
        exchangeId = newExchange.id;
        newExchange.user.id = _id;
        newExchange.user.email = email;
        newExchange.user.username = username;
        await newExchange.save();

        const newTransaction = await Transaction.create(transactionOptions);
        transactionId = newTransaction.id;
        newTransaction.transaction = exchangeId;
        newTransaction.user.id = _id;
        newTransaction.user.email = email;
        newTransaction.user.username = username;
        await newTransaction.save();

        const user = await User.findById(_id);
        user.exchanges.push(exchangeId);
        user[sourceCurrency.toLowerCase()] -= amount; // Subtract from source currency
        user[targetCurrency.toLowerCase()] += amount; // Add to target currency
        user.transactions.push(transactionId);
        await user.save();

        res
          .status(201)
          .json({ message: "Exchange successful", data: { exchangeId } });
      } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Exchange failed", error: true });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: true });
  }
};

////////////////////////////////////
////////////reset password//////////
////////////////////////////////////

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    return res.status(200).json({ message: "Password reset is successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while resetting password" });
  }
};

////////////////////////////////////
///////////forgot password//////////
////////////////////////////////////

const forgotPasword = async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({ email });

  // compare the password and send
  if (user) {
    await sendEmail(email, "Password Reset", "reset.html");
    res.status(200).json({ message: "An email has been sent to you" });
  } else {
    res.status(400).json({
      message: "We could not find an account with that email",
      error: true,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  userInvest,
  userDeposit,
  userVerify,
  userWithdraw,
  userTrade,
  userExchange,
  getExchange,
  getTrade,
  resetPassword,
  forgotPasword,
  getUser,
  getTransaction,
  getDeposit,
  getWithdrawal,
  getInvestment,
};
