const {Router} = require("express")
const gameRoute = Router()
const { getGame } = require("../controllers/gameController")

gameRoute.post("/find", getGame)

module.exports = gameRoute