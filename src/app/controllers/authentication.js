import jwt from "jwt-simple";
import User from "../models/user.js";
import keys from "../config/keys.js";

// Create token for user with user id, time given, and expiration date
export const userToken = async (user) => {
  const timestamp = Math.round(Date.now() / 1000);
  const keySet = await keys(); // Ensure keys() resolves
  const token = jwt.encode(
    {
      sub: user.id, // sub = subject (User ID)
      iat: timestamp, // iat = issued at
      exp: timestamp + 1 * 60 * 60, // exp = expires (in 1 hour)
    },
    keySet.TOKEN_SECRET // secret key for signing token
  );
  return token;
};



// When user logs in, they receive back the user's email and token to make authenticated requests
export const login = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication failed" });
  }

  const token = await userToken(req.user); // Await the token creation

  res.send({ email: req.user.email, username: req.user.username, token });
};



// Function to create a user which has current user's email and token
export const currentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const token = await userToken(req.user); // Await the token

    if (!token || typeof token !== "string") {
      throw new Error("Invalid token generated");
    }

    const user = {
      email: req.user.email,
      username: req.user.username,
      token,
    };

    res.json(user);
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




// Function to create a new account
export const createAccount = async (req, res, next) => {
  const { email, username, password } = req.body;

// Email, username and password are required
  if(!email || !username || !password) {
    return res.status(422).send({ error: 'You must provide and email, username and password'})
  }
  // mongoose will search for existing user matching that email first
  try {
    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });
    if (existingUser) {
      return res.status(422).send({error: 'Email or username is already in use'})
    }
// If email/username isn't in use a new user is created
    const user = new User();
    user.email = email;
    user.username = username;
    user.setPassword(password);

    await user.save()

    res.json({ token: await userToken(user) }); // Await the token

  } catch (err) {
    next(err)
  }
};


const Authentication = {
  userToken,
  login,
  currentUser,
  createAccount,
};

export default Authentication