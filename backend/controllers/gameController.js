const connectMongo = require("../lib/connectMongo");
const Game = require("../models/Game");

async function getGame(req, res) {
  try {
    await connectMongo();
    const { gameCode } = req.params;
    const game = await Game.find({joinCode: gameCode});
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    return res.status(200).json(game);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getGame };