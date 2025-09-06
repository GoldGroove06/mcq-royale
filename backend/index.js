const express = require('express');
const http = require('http');
const { Server } = require('socket.io')

const app = express()


app.use("/", (req, res) => {
    res.send("Hello World !")
})

app.listen(3000, () => {
    console.log("server on port 3000")
})