const {Router} = require("express")
const gameRoute = Router()
const { getGame } = require("../controllers/gameController")

// Fetch game metadata by join code
gameRoute.get("/:gameCode", getGame)

module.exports = gameRoute