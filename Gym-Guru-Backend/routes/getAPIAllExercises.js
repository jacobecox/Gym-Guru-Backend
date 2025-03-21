import express from "express";
import axios from "axios";
import dotenv from 'dotenv';
import Exercise from '../models/exercise.js'

const router = express.Router();

dotenv.config();

const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY
const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST

// Route to get all exercises from ExerciseDB API
router.get('/exercises-from-api', async (req, res) => {
  try {
    const response = await axios.get(`https://${API_HOST}/exercises?limit=0`, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      }
    });
    const exercises = response.data

    // Check to see if each exercise exists
    const savedExercises = await Promise.all(
      exercises.map(async ( exercise ) => {
        const existingExercise = await Exercise.findOne({ id: exercise.id })

        // If the exercise doesn't exist, create the exercise
        if(!existingExercise) {
          return await Exercise.create({exercise: {id: exercise.id, name: exercise.name, equipment: exercise.equipment, target: exercise.target, gifUrl: exercise.gifUrl }  });
        }

        return null
      })
    )
    res.json({ message: 'Exercises fetched and stored successfully', exercises: savedExercises})
  } catch (err) {
    console.error('Error fetching data', err)
    res.status(500).json({ error: 'Failed to fetch data from ExerciseDB API'})
  }
});

export default router;