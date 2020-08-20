const express = require('express')
// const { pathToFileURL } = require('url')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path');

// const { v4: uuidv4 } = require('uuid');


// var engine = require('consolidate');

// app.set('views', __dirname + '/views');
// app.engine('html', engine.mustache);
// app.set('view engine', 'ejs');
const port = process.env.PORT || 3000

app.use(express.static(__dirname + "/public"));
let users = {};
let socketToRoom = {};
let clients = 0
let urlRoomID = "xyz";

io.on('connection', function (socket) {
    // socket.on("sending roomid", roomID =>{
    //     console.log("calling sending roomID: "+roomID);
    //     urlRoomID = roomID;
    // })
    socket.on("join room", roomID => {
        roomID = urlRoomID;
        // console.log(roomID);
        // console.log(urlRoomID+":from url check");
        //console.log(socket.id + "guy just joined the room :-> " + roomID);
        // const usersInThisRoom = users[roomID];
        if (users[roomID]) {
            const len = users[roomID].length;
            if (len === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        }
        else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        //console.log("users:-> ", users);
        //console.log("socketToRoom:-> ", socketToRoom);
        //console.log("usersInThisRoom this is sent to 'all users' -> ", usersInThisRoom);
        socket.emit("all users", usersInThisRoom);
    });
    socket.on("sending signal", payload => {
        //console.log("sending signal -> ", payload.userToSignal,payload.callerID,payload.signal.type);
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        //console.log("returning signal -> ", payload.signal.type,payload.callerID);
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on("endCall", payload => {
        //console.log("endCall received with payload :- ", payload);
        io.to(payload.for).emit('remove div',payload.from);
    });

    socket.on('disconnect', () => {
        //console.log("disconnecting.....yoyo....");
        io.to(socket.id).emit("call ended");
        const roomID = socketToRoom[socket.id];
        delete socketToRoom[socket.id];
        if (users[roomID]) {
            users[roomID] = users[roomID].filter(id => id !== socket.id);
        }
        //console.log("users left -> ", users);
    });
})

// function routing(){

// }

app.get("/video/:id", (req, res) =>{
    urlRoomID = req.params.id;
    // console.log(urlRoomID);
    // res.render("../public/video");
    res.sendFile(path.join(__dirname+"/public/video.html"));
})


http.listen(port, () => console.log(`Active on ${port} port`))


