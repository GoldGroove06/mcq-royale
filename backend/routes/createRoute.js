const {Router } = require("express")
const createRouter = Router()


createRouter.get("/create", (req, res) => {
    res.send("create")
}) 

module.exports = createRouter