const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMsg, generateLocmsg } = require('./utils/messages')
const { addUser, removeUser, getUsers, getUsersinRoom } = require('./utils/users')



const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = socketio(server)

const dirpath = path.join(__dirname, '../public')
app.use(express.json())
app.use(express.static(dirpath))


app.get('', (req, res) => {
    res.render('index.html')
})

io.on('connection', (socket) => {
    console.log('New WebSocket Connection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMsg('Admin', `Welcome  ${user.username}`))
        socket.broadcast.to(user.room).emit('message', generateMsg('Admin', `${user.username} has joined...`))
        io.to(user.room).emit('roomdata', {
            room: user.room,
            users: getUsersinRoom(user.room)
        })
        callback()
    })

    socket.on('sendmessage', (msg, callback) => {
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback('Profanity not allowed')
        }
        const user = getUsers(socket.id)
        io.to(user.room).emit('message', generateMsg(user.username, msg))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMsg('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomdata', {
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }

    })
    socket.on('sendlocation', (loc, callback) => {
        const user = getUsers(socket.id)
        io.emit('locationmsg', generateLocmsg(user.username, `https://google.com/maps?q=${loc.lat},${loc.long}`))
        callback()

    })

})

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})