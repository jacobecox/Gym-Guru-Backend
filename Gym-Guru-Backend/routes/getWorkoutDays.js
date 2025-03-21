import express from "express";
import User from "../models/user.js"
import authMiddleware from "../controllers/authMiddleware.js";

const router = express.Router();

router.get("/workout-days", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming AuthMiddleware attaches `user` to `req`
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.workoutPlan);
  } catch (error) {
    console.error("Error fetching workout days:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;