import express from 'express';
import User from '../models/user.js';
import authMiddleware from '../controllers/authMiddleware.js';

const router = express.Router();

// DELETE route to remove a workout day from the user's plan
router.delete('/workout/:day', authMiddleware, async (req, res) => {
  const { day } = req.params; // The day to delete (e.g., 'Day 1')
  const userId = req.user.id; // Use the user's id from the authentication middleware

  try {
    // Find the user by their id
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out the workout day
    user.workoutPlan = user.workoutPlan.filter((workoutDay) => workoutDay.day !== day);

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: 'Workout day deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
