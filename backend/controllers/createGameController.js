const connectMongo = require("../lib/connectMongo");
const Game = require("../models/Game");

function generateJoinCode(length = 6) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function createUniqueJoinCode() {
  // Try a few times to avoid rare collisions
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateJoinCode(6);
    const existing = await Game.findOne({ joinCode: code });
    if (!existing) return code;
  }
  // Fallback to longer code if many collisions
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateJoinCode(8);
    const existing = await Game.findOne({ joinCode: code });
    if (!existing) return code;
  }
  throw new Error("Unable to generate unique join code");
}

function transformIncomingQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => {
    const options = [q.option1, q.option2, q.option3, q.option4]
      .map((text) => ({ text }))
      .filter((o) => typeof o.text === "string" && o.text.trim().length > 0);

    return {
      text: q.question,
      options,
      correctIndex: typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : 0,
      difficulty: q.difficulty,
    };
  });
}

async function postCreateGame(req, res) {
  try {
    await connectMongo();

    const { name, startTime, questions } = req.body || {};
    if (!name || !startTime || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "name, startTime, and questions are required" });
    }

    const hostUserId = req.user && req.user.id ? req.user.id : null;
    const transformedQuestions = transformIncomingQuestions(questions);

    if (transformedQuestions.length === 0) {
      return res.status(400).json({ message: "At least one valid question is required" });
    }

    const joinCode = await createUniqueJoinCode();

    const game = await Game.create({
      name,
      startTime: new Date(startTime),
      host: hostUserId,
      questions: transformedQuestions,
      joinCode,
    });

    return res.status(201).json({
      message: "Game created",
      gameId: game._id,
      joinCode: game.joinCode,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getLatestCreatedGame(req, res) {
  try {
    await connectMongo();
    const hostUserId = req.user && req.user.id ? req.user.id : null;
    if (!hostUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const game = await Game.findOne({ host: hostUserId })
      .sort({ createdAt: -1 })
      .select({ name: 1, joinCode: 1, _id: 1, startTime: 1, status: 1 })
      .lean();

    if (!game) {
      return res.status(200).json({ game: null });
    }

    return res.status(200).json({
      game: {
        gameId: game._id,
        name: game.name,
        joinCode: game.joinCode,
        startTime: game.startTime,
        status: game.status,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { postCreateGame, getLatestCreatedGame };


