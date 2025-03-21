import express from "express";
import User from "../models/user.js"
import authMiddleware from "../controllers/authMiddleware.js";

const router = express.Router();

router.delete("/workout-days/:day/exercises/:exerciseId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { day, exerciseId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find workout day
    const workoutDay = user.workoutPlan.find((workout) => workout.day === day);
    if (!workoutDay) {
      return res.status(404).json({ message: "Workout day not found" });
    }

    // Remove the exercise
    workoutDay.exercises = workoutDay.exercises.filter((exercise) => exercise.id !== exerciseId);
    await user.save();

    res.json({ message: "Exercise removed successfully", workoutPlan: user.workoutPlan });
  } catch (error) {
    console.error("Error removing exercise:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;