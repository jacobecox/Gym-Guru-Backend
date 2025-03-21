import express from "express";
import axios from "axios";
import dotenv from 'dotenv';
import MuscleCategory from "../models/muscleCategory.js";
import EquipmentCategory from "../models/equipmentCategory.js"

const router = express.Router();

dotenv.config();

const API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY
const API_HOST = process.env.NEXT_PUBLIC_RAPIDAPI_HOST

// Route to fetch Muscle Categories from ExerciseDB API
router.get('/muscleCategories-from-api', async (req, res) => {
  try {
    const response = await axios.get(`https://${API_HOST}/exercises/targetList`, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      }
    });
    const muscleCategories = response.data
    
    const savedMuscleCategories = await Promise.all(
      muscleCategories.map(async (muscleCategoryName) => {
        // Checks to see if the muscle category exists already
        const existingMuscleCategory = await MuscleCategory.findOne({ name: muscleCategoryName})

        if (!existingMuscleCategory) {
          return await MuscleCategory.create({ name: muscleCategoryName });
        }
        return existingMuscleCategory;
      })
    )
    res.json({ message: 'Muscle categories fetched and stored successfully', muscleCategories: savedMuscleCategories})
  } catch (err) {
    console.error('Error fetching data:',err)
    res.status(500).json({ error: 'Failed to fetch data from ExerciseDB API'})
  }
});

// Route to get Equipment Categories from ExerciseDB API
router.get('/equipmentCategories-from-api', async (req, res) => {
  try {
    const response = await axios.get(`https://${API_HOST}/exercises/equipmentList`, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      }
    });
    const equipmentCategories = response.data
    
    const savedEquipmentCategories = await Promise.all(
      equipmentCategories.map(async (equipmentCategoryName) => {
        // Checks to see if the equipment category exists already
        const existingEquipmentCategory = await EquipmentCategory.findOne({ name: equipmentCategoryName})

        if (!existingEquipmentCategory) {
          return await EquipmentCategory.create({ name: equipmentCategoryName });
        }
        return existingEquipmentCategory;
      })
    )
    res.json({ message: 'Equipment categories fetched and stored successfully', equipmentCategories: savedEquipmentCategories})
  } catch (err) {
    console.error('Error fetching data:',err)
    res.status(500).json({ error: 'Failed to fetch data from ExerciseDB API'})
  }
});

export default router;