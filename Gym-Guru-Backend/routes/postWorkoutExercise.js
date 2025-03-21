import express from "express";
import User from "../models/user.js"
import authMiddleware from "../controllers/authMiddleware.js";

const router = express.Router();

// Posts new workout day
router.post("/workout-days", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { day } = req.body;

    if (!day) {
      return res.status(400).json({ message: "Day name is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if day already exists
    if (user.workoutPlan.some((workoutDay) => workoutDay.day === day)) {
      return res.status(400).json({ message: "Day already exists" });
    }

    // Add new day
    user.workoutPlan.push({ day, exercises: [] });
    await user.save();

    res.status(201).json({ message: "Workout day added successfully", day });
  } catch (error) {
    console.error("Error adding workout day:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Posts workout to workout day
router.post("/workout-days/:day/exercises", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { day } = req.params;
    const { id, name, equipment, target } = req.body;

    if (!id || !name || !equipment || !target) {
      return res.status(400).json({ message: "All exercise details are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the workout day
    const workoutDay = user.workoutPlan.find((workout) => workout.day === day);
    if (!workoutDay) {
      return res.status(404).json({ message: "Workout day not found" });
    }

    // Add the exercise
    workoutDay.exercises.push({ id, name, equipment, target });
    await user.save();

    res.json({ message: "Exercise added successfully", workoutPlan: user.workoutPlan });
  } catch (error) {
    console.error("Error adding exercise:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;