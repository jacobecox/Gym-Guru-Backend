import passport from "passport";
import User from "../models/user.js";
import { ExtractJwt, Strategy } from "passport-jwt";
import LocalStrategy from "passport-local";
import keys from "../config/keys.js";

// Passport expects username field to be a username, we are specifying the username field to be either email or username
const localOptions = { usernameField: 'login' };

const keySet = await keys();

const localLogin = new LocalStrategy(localOptions, async (login, password, done) => {
  // Verify this email and password, call done with the user
	// if it is the correct email and password
	// otherwise, call done with false
  try{
  const user = await User.findOne({
    $or: [{ email: login }, { username: login }],
  })
    if (!user) {
      return done(null, false)
    }
    if (!user.validPassword(password)) {
      return done(null, false, {message: 'Incorrect password'})
    }
    return done(null, user)
  } catch(err) {
    return done(err)
  };
});

// Retrieve token from header and use token secret to verify jwt
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: keySet.TOKEN_SECRET,
};

// Create JWT Strategy
const jwtLogin = new Strategy(jwtOptions, async (payload, done) => {
    // See if the user ID in the payload exists in our database
    // If it does, call 'done' with that
    // otherwise, call done without a user object
    try {
      console.log('jwt options:', jwtOptions)
      const user = await User.findById(payload.sub);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  });

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin); 