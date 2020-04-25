const socket = io()

//Elements
const DOMElements = {
    messageform: document.getElementById('message-form'),
    messageforminput: document.getElementById('inpu'),
    messageformButton: document.getElementById('busend'),
    sendlocationButton: document.getElementById('buloc'),
    message: document.getElementById('msg'),
    sidebar: document.getElementById('sidebar')

}

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //new message el
    const newmsg = DOMElements.message.lastElementChild

    //height of new msg
    const newmsgstyle = getComputedStyle(newmsg)
    const newmsgmargin = parseInt(newmsgstyle.marginBottom)
    const newmsght = newmsg.offsetHeight + newmsgmargin

    //visible height
    const visibleht = DOMElements.message.offsetHeight

    //height of message container
    const containerht = DOMElements.message.scrollHeight

    //how far scrolled
    const scrolloffset = DOMElements.message.scrollTop + visibleht

    if (containerht - newmsght <= scrolloffset) {
        DOMElements.message.scrollTop = DOMElements.message.scrollHeight
    }
}

socket.on('message', (message) => {
    var markup = `<div class="message"><p><span class="message__name">${message.username}</span>: <span class="message__meta">${moment(message.createdAt).format('LT')}</span></p><p>${message.text}</p></div>`
    DOMElements.message.insertAdjacentHTML('beforeend', markup)
    autoscroll()

})

socket.on('locationmsg', (locmsg) => {
    var markup = `<div class="message"><p><span class="message__name">${locmsg.username}</span>: <span class="message__meta">${moment(locmsg.createdAt).format('LT')}</span></p><p><a href=${locmsg.url} target="_blank">My Current Location</a></p></br></div>`
    DOMElements.message.insertAdjacentHTML('beforeend', markup)
    autoscroll()
})

socket.on('roomdata', ({ room, users }) => {
    var mu = `<h2 class="room-title">${room}</h2><h3 class="list-title">Users</h3>`
    DOMElements.sidebar.innerHTML = mu
    users.forEach((user) => {
        var markup = `<ul class="users">${user.username}</ul>`
        DOMElements.sidebar.innerHTML += markup
    })
})

DOMElements.messageformButton.addEventListener('click', e => {
    e.preventDefault()

    DOMElements.messageformButton.setAttribute('disabled', 'disabled')
    var message = DOMElements.messageforminput.value
    socket.emit('sendmessage', message, (err) => {
        DOMElements.messageformButton.removeAttribute('disabled')
        DOMElements.messageforminput.value = ""
        DOMElements.messageforminput.focus()
        if (err) {
            return console.log(err)
        }
        console.log('Message Delivered')
    })
})

DOMElements.sendlocationButton.addEventListener('click', (e) => {
    e.preventDefault()
    DOMElements.sendlocationButton.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert('Your browser does not support this')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        var loc = {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }
        socket.emit('sendlocation', loc, () => {
            console.log('Location Shared')
            DOMElements.sendlocationButton.removeAttribute('disabled')
        })

    })

})

socket.emit('join', { username, room }, (err) => {
    if (err) {
        alert(err)
        location.href = '/'
    }
})