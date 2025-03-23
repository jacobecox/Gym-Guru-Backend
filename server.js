// Dependencies
import express from 'express';
import mongoose from 'mongoose';
import MongoStore from "connect-mongo";
import cors from 'cors';
import passport from 'passport';
import keys from './src/app/config/keys.js'
import User from './src/app/models/user.js';
import session from "express-session";
import GoogleStrategy from 'passport-google-oauth20';
import config from './config.js';
import './src/app/services/passport.js';

// Routes
import Authentication from "./src/app/controllers/authentication.js"
import getAPICategories from './src/app/routes/getAPICategories.js'
import getAllAPIExercises from './src/app/routes/getAPIAllExercises.js'
import getCategories from './src/app/routes/getCategories.js'
import getAllExercises from './src/app/routes/getAllExercises.js'
import postSavedExercises from './src/app/routes/postSavedExercises.js'
import deleteSavedExercises from './src/app/routes/deleteSavedExercises.js'
import getSavedExercises from './src/app/routes/getSavedExercises.js'
import getWorkoutDays from './src/app/routes/getWorkoutDays.js'
import postWorkoutExercise from './src/app/routes/postWorkoutExercise.js'
import deleteWorkoutExercise from './src/app/routes/deleteWorkoutExercise.js'
import deleteWorkoutDay from './src/app/routes/deleteWorkoutDay.js'

const app = express();
app.use(express.json());

const GOOGLE_CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID;
const BASE_URL = config.BASE_URL
const FRONTEND_URL = config.FRONTEND_URL
const MONGO_URI = config.MONGO_URI

app.use(cors({
	origin: FRONTEND_URL,	
	credentials: true,
}));

// Storing sessions inside db used
app.use(
  session({
    secret: "passkeysecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions",
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google Oauth functionality. We send client details through link which reroutes user to Google to login. Google returns via callback route with user's data
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }
				// Create new user with google id if one doesn't exist
        const newUser = await new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
        }).save();

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"] })

// Handles when google send user back with data. We store user data with token in url params to be sent back when redirected to our success page
const handleAuthRedirect = async (req, res) => {

  if (req.isAuthenticated() && req.user) {
    try {
      const token = await Authentication.userToken(req.user); // ✅ Await the token properly

      res.redirect(`${BASE_URL}/pages/login-success?token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error("Error generating token:", error);
      res.redirect(`${BASE_URL}/pages/login?error=token_generation_failed`);
    }
  } else {
    console.error("User not authenticated");
    res.redirect(`${BASE_URL}/pages/login?error=auth_failed`);
  }
};




const requireAuth = passport.authenticate('jwt');
const requireLogin = passport.authenticate('local');

const keySet = await keys();

mongoose
  .connect(keySet.MONGO_URI)
  .then(() => {
    console.log('🚀 DB Connected!');
    if (process.env.NODE_ENV !== "test") { // Prevent server from starting in test mode
      const port = process.env.PORT || 8080;
      console.log('port:', port)
      console.log('mongo URI:', keySet.MONGO_URI)
      app.listen(port, () => {
        console.log('😎 Server listening on PORT', port);
      });
    }
  })
  .catch((err) => {
    console.log(`❌ DB Connection Error: ${err.message}`);
  });

// Non-login required routes
app.use('/api', getAPICategories)
app.use('/api', getAllAPIExercises)
app.use(getCategories)
app.use(getAllExercises)
app.use(getWorkoutDays)
app.use(postWorkoutExercise)
app.use(deleteWorkoutExercise)
app.use(deleteWorkoutDay)

// Login required routes
app.post('/auth/login', requireLogin, Authentication.login);
app.post('/auth/create-account', Authentication.createAccount);
app.get('/auth/current-user', requireAuth, Authentication.currentUser);
app.use(postSavedExercises);
app.use(deleteSavedExercises);
app.use(getSavedExercises);

// Google login and logout routes
app.get("/auth/google", googleAuth);
app.get("/auth/google/callback", googleAuth, handleAuthRedirect)

export default app;