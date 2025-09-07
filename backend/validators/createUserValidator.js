const { body } = require("express-validator");
const mongoose = require("mongoose");
const User = require("../models/user.js");
const connectMongo = require("../lib/connectMongo.js");

const emailCheck = () => {
  return body("email")
    .isEmail()
    .withMessage("Must be a valid email")
    .custom(async (value) => {
      console.log("Checking email in Mongo...");
      await connectMongo();
      const existingUser = await User.findOne({ email: value });

      if (existingUser) {
        console.log("Duplicate email found");
        throw new Error("A user already exists with this e-mail address");
      }
    });
};

module.exports = { emailCheck };
