const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const createRoute = require("./routes/createRoute")

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: ['*'],
        methods: ["GET", "POST"],
        credentials: false
    }
})


io.on('connection', (socket) => {
    socket.broadcast("yo yo")
})

app.use("/create", createRoute)
app.use("/", (req, res) => {
    res.send("Hello World !")
})

app.listen(3000, () => {
    console.log("server on port 3000")
})