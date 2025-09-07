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
const Game = require("./models/Game");
const connectMongo = require('./lib/connectMongo');
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
// const questions = [
//     {
//         id: 1,
//         text: "Which language runs in a web browser?",
//         options: ["Java", "C", "Python", "JavaScript"],
//         correctIndex: 3, // JavaScript
//         difficulty: "easy",
//     },
//     {
//         id: 2,
//         text: "What does CSS stand for?",
//         options: [
//             "Central Style Sheets",
//             "Cascading Style Sheets",
//             "Cascading Simple Sheets",
//             "Cars SUVs Sailboats"
//         ],
//         correctIndex: 1, // Cascading Style Sheets
//         difficulty: "easy",
//     },
//     {
//         id: 3,
//         text: "Which of the following is NOT a JavaScript framework?",
//         options: ["React", "Angular", "Django", "Vue"],
//         correctIndex: 2, // Django
//         difficulty: "medium",
//     },
//     {
//         id: 4,
//         text: "What is the time complexity of binary search in a sorted array?",
//         options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
//         correctIndex: 1, // O(log n)
//         difficulty: "medium",
//     },
//     {
//         id: 5,
//         text: "In databases, what does ACID stand for?",
//         options: [
//             "Automatic, Consistent, Isolated, Durable",
//             "Atomicity, Consistency, Isolation, Durability",
//             "Access, Control, Integrity, Data",
//             "Analysis, Computation, Indexing, Distribution"
//         ],
//         correctIndex: 1, // Atomicity, Consistency, Isolation, Durability
//         difficulty: "hard",
//     }
// ];

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

const roomQuestions = {}
const roomUsers = {}
const roomState = {}

io.on('connection', (socket) => {
  console.log('socket connected:', socket.id)

  socket.on('joinroom', async (room) => {
    try {
      // Load room data once
      if (!roomQuestions[room] || !roomState[room]) {
        await connectMongo()
        const gameDoc = await Game.findOne({ joinCode: room })
        if (!gameDoc) {
          socket.emit('room:error', 'Game not found')
          return
        }

        roomQuestions[room] = gameDoc.questions
        const startTime = new Date(gameDoc.startTime).getTime()
        const joinCloseTime = startTime + 2 * 60 * 1000 // 2 minutes after start

        roomState[room] = {
          startTime,
          joinCloseTime,
          started: false,
          ended: false,
          currentQuestionIndex: -1,
          questionTimer: null,
        }
        console.log(`Initialized room ${room} with startTime=${new Date(startTime).toISOString()}`)
      }

      const state = roomState[room]
      const now = Date.now()

      // Enforce 2-minute join window after start
      if (now > state.joinCloseTime) {
        socket.emit('room:closed')
        return
      }

      // Track user in room
      if (!roomUsers[room]) roomUsers[room] = {}
      roomUsers[room][socket.id] = {
        name: socket.user?.email || 'player',
        lives: 3,
        eliminated: false,
        lastAnsweredForIndex: -1,
      }

      socket.join(room)
      console.log(`User ${socket.id} joined room ${room}`)

      // Inform user of room status
      if (now < state.startTime) {
        socket.emit('room:waiting', { msUntilStart: state.startTime - now })
      } else {
        socket.emit('room:started')
        // If game already started and there's an active/current question, send it to this late joiner
        if (state.currentQuestionIndex >= 0 && Array.isArray(roomQuestions[room])) {
          const current = roomQuestions[room][state.currentQuestionIndex]
          if (current) io.to(socket.id).emit('question', current)
        }
      }
      socket.emit('room:join-window', { msUntilClose: Math.max(0, state.joinCloseTime - now) })

      // Start the game schedule once when startTime is reached
      if (!state.started) {
        const msUntilStart = Math.max(0, state.startTime - now)

        setTimeout(() => {
          if (state.started) return
          state.started = true
          io.to(room).emit('game:started')

          // Send questions every 60s
          const questions = roomQuestions[room]
          state.currentQuestionIndex = -1

          const sendNext = () => {
            state.currentQuestionIndex += 1
            const idx = state.currentQuestionIndex
            if (idx >= questions.length) {
              state.ended = true
              clearInterval(state.questionTimer)
              io.to(room).emit('game:end', 'No more questions! 🎉')
              return
            }

            io.to(room).emit('question', questions[idx])
          }

          sendNext()
          state.questionTimer = setInterval(sendNext, 60 * 1000)
        }, msUntilStart)
      }

      // Auto-emit room closed at joinCloseTime to all
      const msUntilClose = Math.max(0, state.joinCloseTime - now)
      setTimeout(() => io.to(room).emit('room:closed'), msUntilClose)

      // Handle answers per question
      socket.on('answer', (answerIndex) => {
        const user = roomUsers[room]?.[socket.id]
        const questions = roomQuestions[room]
        const state = roomState[room]
        if (!user || !questions || !state || state.currentQuestionIndex < 0) return
        if (user.eliminated) return

        const qIndex = state.currentQuestionIndex
        // Prevent multiple answers for the same question from same user
        if (user.lastAnsweredForIndex === qIndex) return
        user.lastAnsweredForIndex = qIndex

        const isCorrect = questions[qIndex]?.correctIndex === Number(answerIndex)
        if (!isCorrect) {
          user.lives -= 1
          if (user.lives <= 0) {
            user.eliminated = true
            io.to(socket.id).emit('player:eliminated')
            // broadcast elimination to room
            io.to(room).emit('player:eliminated', { playerId: socket.id, name: user.name })
          }
        }
        // notify the user of their result/lives
        io.to(socket.id).emit('lives:update', { lives: user.lives, correct: isCorrect })
        // broadcast the answer result to room for updates feed
        io.to(room).emit('answer:result', { playerId: socket.id, name: user.name, correct: isCorrect })

        // Check winner condition: last remaining non-eliminated
        const remainingEntries = Object.entries(roomUsers[room] || {}).filter(([_, u]) => !u.eliminated)
        if (!state.ended && remainingEntries.length === 1) {
          const [winnerSocketId, winnerUser] = remainingEntries[0]
          state.ended = true
          if (state.questionTimer) clearInterval(state.questionTimer)
          // Congratulate winner; end game for room with winner info
          io.to(winnerSocketId).emit('game:win', { name: winnerUser.name })
          io.to(room).emit('game:end', { reason: 'winner', winnerName: winnerUser.name })
        }
      })

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        if (roomUsers[room]) {
          delete roomUsers[room][socket.id]
        }
      })
    } catch (err) {
      console.error(err)
      socket.emit('error', 'Could not join room')
    }
  })
})



app.use("/create", authenticateToken, createRoute)
app.use("/game", authenticateToken, gameRoute)


server.listen(3000, () => {
    console.log("server on port 3000")
})