const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  // Get token from the request headers
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // If no token is found, return an error
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify the token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user associated with the decoded ID
    const user = await User.findById(decoded.user.id);

    // If no user is found, return an error
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    // Add user to the request object for further use in the route handler
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;
