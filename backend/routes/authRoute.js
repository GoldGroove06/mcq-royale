const { Router } = require("express")
const authRoute = Router()
const { getSignin, postSignin } = require("../controllers/signinController")
const { getSignup, postSignup } = require("../controllers/signupController")
const { emailCheck } = require("../validators/createUserValidator")


authRoute.get("/signin", getSignin)
authRoute.post("/signin", postSignin)


authRoute.get("/signup", getSignup)
authRoute.post("/signup", emailCheck(), postSignup)

module.exports = authRoute