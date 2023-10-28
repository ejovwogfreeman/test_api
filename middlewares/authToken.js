const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(400)
      .json({ message: "Please Login First.", error: true });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { ...verified.user, token };
    next();
  } catch (err) {
    res.status(400).json({ ...err, error: true });
  }
};
