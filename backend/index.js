const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const createRoute = require("./routes/createRoute")
const bodyParser = require('body-parser');
const authRoute = require("./routes/authRoute")
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// require('dotenv').config()

const app = express()
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true               
}));
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        
        origin: ['*'],
        methods: ["GET", "POST"],
        credentials: false
    }
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const secret = 'a santa at nasa';


app.use(cookieParser());


app.use("/auth", authRoute)


app.get("/", (req, res) => {
  res.send("backend")
})

app.get("/log-out", (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; 
    next();
  } catch (err) {
    res.sendStatus(403);
  }
}
app.use("/auth-check", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Authenticated" });
});

io.on('connection', (socket) => {
    socket.broadcast("yo yo")
})

app.use("/create", authenticateToken, createRoute)


app.listen(3000, () => {
    console.log("server on port 3000")
})