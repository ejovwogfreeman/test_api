const Support = require("../models/supportModel");

const postSupport = (req, res) => {
  res.send(req.body);
};

const getSupport = async (req, res) => {
  let supports = await Support.find();
  res.status(200).json(supports);
};

module.exports = {
  postSupport,
  getSupport,
};
