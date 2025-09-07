const connectMongo = require("../lib/connectMongo");
const Game = require("../models/Game");

async function getGame(req, res) {
  try {
    await connectMongo();
    const codeFromParams = req.params?.gameCode;
    const codeFromBody = req.body?.gameCode;
    const joinCode = codeFromParams || codeFromBody;

    if (!joinCode) {
      return res.status(400).json({ message: "gameCode is required" });
    }

    const game = await Game.findOne({ joinCode })
      .select('name joinCode startTime status');

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    return res.status(200).json({
      game: {
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

module.exports = { getGame };