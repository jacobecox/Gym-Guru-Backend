import mongoose from "mongoose";
import crypto from "crypto"

const Schema = mongoose.Schema

const UserSchema = new Schema({
	googleId: String,
	email: { type: String, unique: true, lowercase: true },
	username: { type: String, unique: true },
	hash: String,
	salt: String,
	savedExercises: [{
		id: String,
		name: String,
		equipment: String,
		target: String,
}],
	workoutPlan: [{
      day: String,
      exercises: [{
				id: String,
				name: String,
				equipment: String,
				target: String
			}], 
    }]
});

// Before user sets password, passport hashes and salts the password to be saved
UserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto
		.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
		.toString('hex');
};

// Once a login password is entered, passport hashes and salts that password and compares to stored password, if match it is correct, if not match it is incorrect
UserSchema.methods.validPassword = function (password) {
	let hash = crypto
		.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
		.toString('hex');

	return this.hash === hash;
};

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;