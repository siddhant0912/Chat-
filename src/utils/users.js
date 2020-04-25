const users = []

const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }
    const existinguser = users.find((user) => {
        return user.room === room && user.username === username

    })

    if (existinguser) {
        return {
            error: 'User Already in room'
        }
    }
    const user = { id, username, room }
    users.push(user)
    return { user }

}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}


const getUsers = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersinRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}



module.exports = {
    addUser,
    removeUser,
    getUsers,
    getUsersinRoom
}