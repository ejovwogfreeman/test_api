const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(400).json({ message: "Please Login First." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified.user.isAdmin)
      return res
        .status(400)
        .send("You are not authenticated to access this page");
    next();
  } catch (err) {
    res.status(400).json(err);
  }
};
