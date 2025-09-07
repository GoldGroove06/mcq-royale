const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [optionSchema], required: true, validate: v => v.length === 4 },
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
});

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startTime: { type: Date, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    questions: { type: [questionSchema], required: true },
    joinCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["waiting", "in-progress", "finished"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);

module.exports = Game;
