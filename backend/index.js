const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const createRoute = require("./routes/createRoute")
const bodyParser = require('body-parser');
const authRoute = require("./routes/authRoute")
const gameRoute = require("./routes/gameRoute")
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
        
        origin: ['http://localhost:5173'],
        methods: ["GET", "POST"],
        credentials: true
    }
})
const questions = [
    {
        id: 1,
        text: "Which language runs in a web browser?",
        options: ["Java", "C", "Python", "JavaScript"],
        correctIndex: 3, // JavaScript
        difficulty: "easy",
    },
    {
        id: 2,
        text: "What does CSS stand for?",
        options: [
            "Central Style Sheets",
            "Cascading Style Sheets",
            "Cascading Simple Sheets",
            "Cars SUVs Sailboats"
        ],
        correctIndex: 1, // Cascading Style Sheets
        difficulty: "easy",
    },
    {
        id: 3,
        text: "Which of the following is NOT a JavaScript framework?",
        options: ["React", "Angular", "Django", "Vue"],
        correctIndex: 2, // Django
        difficulty: "medium",
    },
    {
        id: 4,
        text: "What is the time complexity of binary search in a sorted array?",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        correctIndex: 1, // O(log n)
        difficulty: "medium",
    },
    {
        id: 5,
        text: "In databases, what does ACID stand for?",
        options: [
            "Automatic, Consistent, Isolated, Durable",
            "Atomicity, Consistency, Isolation, Durability",
            "Access, Control, Integrity, Data",
            "Analysis, Computation, Indexing, Distribution"
        ],
        correctIndex: 1, // Atomicity, Consistency, Isolation, Durability
        difficulty: "hard",
    }
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const secret = 'a santa at nasa';


app.use(cookieParser());


app.use("/auth", authRoute)


app.get("/", (req, res) => {
  res.send("backend")
})

// in-memory room user state
const roomUser = {}

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

io.use((socket, next) => {
  try {
    const cookieHeader = socket.request.headers?.cookie || '';
    const token = cookieHeader
      .split('; ')
      .find((c) => c.startsWith('token='))
      ?.split('=')[1];
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    const decoded = jwt.verify(token, secret);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('authentication error'))
  }
})

io.on('connection', (socket) => {
    console.log('socket connected:', socket.id)
    socket.on('joinroom', (room) => {
        //intialize 
        roomUser[socket.id] = {
            name: 'ar',
            lives: 3,
            eliminated: false
        }
        socket.join(room)
        console.log('index.js : a user connected to the room')


        // start condition with time
        // fix the last interval and remove the first interval
        if (true) {
            //send questions
            let index = 0;

            const interval = setInterval(() => {
                if (index >= questions.length ) {
                    clearInterval(interval);
                    socket.emit("game:end", "No more questions! 🎉");
                    return;
                }

                console.log(questions[index]);

                socket.emit("question", questions[index]);
                socket.on('answer', (answer) => {
                    console.log("in answer")
                    if (questions[index].correctIndex != answer) {
                        roomUser[socket.id].lives = roomUser[socket.id].lives-1
                        console.log(roomUser[socket.id], "incorrect")
                    }else{
                        console.log("correct")
                    }

                })
                index++;
            }, 5 * 1000);

        }

    })


})

app.use("/create", authenticateToken, createRoute)
app.use("/game", authenticateToken, gameRoute)


server.listen(3000, () => {
    console.log("server on port 3000")
})