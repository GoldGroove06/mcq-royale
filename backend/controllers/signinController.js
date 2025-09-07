const jwt = require("jsonwebtoken");
const secret = "a santa at nasa";
const bcrypt = require("bcrypt");
const connectMongo = require("../lib/connectMongo");
const User = require("../models/user");

async function getSignin(req, res) {
  try {
    res.send("signin");
  } catch {
    console.log("error in GETSignin");
  }
}

async function postSignin(req, res) {
  const { email, password } = req.body;
  try {
    await connectMongo(); // ensure DB connection

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No user found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 3600000,
    });

    return res.json({ message: "Logged in" });
  } catch (error) {
    console.error(error);
    console.log("error in PostSignin");
  }
}

module.exports = { getSignin, postSignin };
