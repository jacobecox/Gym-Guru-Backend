import express from "express";
import User from "../models/user.js"
import authMiddleware from "../controllers/authMiddleware.js";

const router = express.Router();

router.get('/saved-exercises', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exercises = user.savedExercises

    res.json({ savedExercises: exercises });
  } catch (err) {
    console.error("Error fetching saved exercises:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

export default router;