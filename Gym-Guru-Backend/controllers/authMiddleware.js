import jwt from "jwt-simple";
import User from "../models/user.js";
import keys from "../config/keys.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // retrieves token from header
    const token = req.header("Authorization")?.split(" ")[1];
    const keySet = await keys();

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // jwt method to decode token to get user id
    const decoded = jwt.decode(token, keySet.TOKEN_SECRET);

    if (!decoded || !decoded.sub) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // finds user with corresponding id and matching password
    if (process.env.NODE_ENV === "test") {
      req.user = await User.findById(decoded.sub);
    } else {
      req.user = await User.findById(decoded.sub).select("-password");
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    next();
  } catch (err) {
    console.error("JWT Decode Error:", err);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

export default authMiddleware