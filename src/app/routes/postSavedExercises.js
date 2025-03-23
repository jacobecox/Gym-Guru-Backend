import express from "express";
import User from "../models/user.js"
import authMiddleware from "../controllers/authMiddleware.js";

const router = express.Router();

router.post('/saved-exercises', authMiddleware, async (req, res) => {
  try {
    const { id, name, equipment, target } = req.body;
    const userId = req.user._id;

    if (!id) {
      return res.status(400).json({ message: "Missing exercise id" });
    }

    const existingExercise = await User.findOne({ _id: userId, "savedExercises.id": id });

    if (existingExercise) {
      return res.status(400).json({ message: "Exercise already saved" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedExercises: {id, name, equipment, target} } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Exercise saved", savedExercises: user.savedExercises });
  } catch (err) {
    console.error("Error saving exercise:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

export default router;