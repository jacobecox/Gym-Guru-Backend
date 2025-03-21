import mongoose from "mongoose";

const Schema = mongoose.Schema;

const muscleCategorySchema = new Schema({
  name: String,
});

const MuscleCategory = mongoose.model("MuscleCategory", muscleCategorySchema);

export default MuscleCategory;
