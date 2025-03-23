import express from "express";
import Exercise from '../models/exercise.js'

const router = express.Router();

router.get('/all-exercises', async (req, res, next) => {
  try {
    const { muscle, equipment, page = 1 } = req.query

    const query = {};

    if (muscle && muscle !== 'All') {
      query["exercise.target"] = muscle;
    }

    if (equipment && equipment !== 'All') {
      query["exercise.equipment"] = equipment;
    }

    const perPage = 15;  

    const exercises = await Exercise.find(query)  
    .skip(perPage * page - perPage)
    .limit(perPage),
    totalExercises = await Exercise.countDocuments(query)

    res.json({
      exercises,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalExercises / perPage),
      totalExercises: totalExercises,
    });

  } catch (err) {
    next(err)
  }
})

export default router