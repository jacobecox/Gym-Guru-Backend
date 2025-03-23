import mongoose from "mongoose";

const Schema = mongoose.Schema;

const equipmentCategorySchema = new Schema({
  name: String,
});

const EquipmentCategory = mongoose.model("EquipmentCategory", equipmentCategorySchema);

export default EquipmentCategory;