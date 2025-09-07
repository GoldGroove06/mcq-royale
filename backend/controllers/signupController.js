const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const connectMongo = require("../lib/connectMongo");
const User = require("../models/user.js");


async function getSignup(req, res) {
  try {
    res.send("signup");
  } catch {
    console.log("error in Signup");
  }
}

async function postSignup(req, res) {
  try {
    await connectMongo(); // ensure DB connection
     console.log("in signup...");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, confirmPassword, username } = req.body;

    if (password != confirmPassword) {
      return res.status(400).json({ errors: "password does not match" });
    }

    if (name && email && password) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      // Create new user
      await User.create({
        name,
        email,
        password: hashedPassword,
        username
      });


      return res.status(200).json({ m: "signup successful" });
    }

    res.status(500).send("internal server error");
  } catch (error) {
    console.error(error);
    console.log("error in PostSignup");
  }
}

module.exports = { getSignup, postSignup };
