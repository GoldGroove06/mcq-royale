const {Router } = require("express")
const { postCreateGame, getLatestCreatedGame } = require("../controllers/createGameController");
const createRouter = Router()

createRouter.post("/", postCreateGame)
createRouter.get("/latest", getLatestCreatedGame)

module.exports = createRouter