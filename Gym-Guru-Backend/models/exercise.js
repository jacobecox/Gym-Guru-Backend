import mongoose from "mongoose";

const Schema = mongoose.Schema

const exerciseSchema = new Schema({
exercise: {
  id: String,
  name: String,
  equipment: String,
  target: String,
  gifUrl: String,
}
})

const Exercise = mongoose.model('Exercise', exerciseSchema)

export default Exercise