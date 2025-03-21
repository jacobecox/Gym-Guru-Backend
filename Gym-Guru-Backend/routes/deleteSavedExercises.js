import express from "express";
import User from "../models/user.js"
import authMiddleware from "../controllers/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

router.delete('/saved-exercises', authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user._id;

    // Check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if exercise ID is provided
    if (!id) {
      return res.status(400).json({ message: "Missing exerciseId" });
    }

    // Remove the exercise from savedExercises array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedExercises: { id: id } } },
      { new: true } // This ensures the updated user document is returned
    );

    // Check if user exists after update
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the response with updated savedExercises
    res.json({
      message: "Exercise removed",
      savedExercises: user.savedExercises, // This is the updated savedExercises array
    });
  } catch (err) {
    console.error("Error removing exercise:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



export default router;