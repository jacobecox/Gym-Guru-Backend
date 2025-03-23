import express from "express";
import MuscleCategory from "../models/muscleCategory.js";
import EquipmentCategory from "../models/equipmentCategory.js"

const router = express.Router();

// Route to get muscle categories from db
router.get('/muscle-categories', async (req, res, next) => {
  try {
    const muscleCategories = await MuscleCategory.find()
    res.status(200).json(muscleCategories);
  }
  catch (err) {
    next(err)
  }
});

// Route to get equipment categories from db
router.get('/equipment-categories', async (req, res, next) => {
  try {
    const equipmentCategories = await EquipmentCategory.find()
    res.status(200).json(equipmentCategories);
  }
  catch (err) {
    next(err)
  }
});

export default router;