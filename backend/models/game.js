const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true }, // option text
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true }, // question statement
  options: { type: [optionSchema], required: true, validate: v => v.length === 4 }, // 4 options
  correctIndex: { type: Number, required: true, min: 0, max: 3 }, // which option is correct
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
});

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // quiz name
    startTime: { type: Date, required: true }, // scheduled start
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional: who created it
    questions: { type: [questionSchema], required: true },
    // players: [
    //   {
    //     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //     username: String,
    //     lives: { type: Number, default: 3 },
    //     eliminated: { type: Boolean, default: false },
    //   },
    // ],
    status: {
      type: String,
      enum: ["waiting", "in-progress", "finished"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);
export default Game;
