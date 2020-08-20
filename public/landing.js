const { v4: uuidv4 } = require('uuid');
let roomID = "foobar";
// const express = require('express')
// const app = express()
// let socket = io()

const createRoom = document.querySelector('#createRoomButton');
const joinRoom = document.querySelector('#joinRoomButton');

createRoom.addEventListener('click', () => {
    roomID = uuidv4();

    // console.log(roomID+"-< from create room");
    // socket.emit("sending roomid",roomID);
    let s = "/video/"+roomID;
    // console.log(s);
    createRoom.setAttribute("href",s);
    // crb.innerHTML = "";
    // var s = "Your Room ID is : " + roomID;
    // crb.innerHTML = s;
    // getStream(roomID);
});

joinRoom.addEventListener('click', () => {
    roomID = document.querySelector('#roomID').value;
    let s = "/video/"+roomID;
    // console.log(roomID+"-< from joinRoom room");
    joinRoom.setAttribute("href",s);
    // socket.emit("sending roomid",roomID);
    // document.querySelector('#roomID').value = "";
    // crb.innerHTML = "";
    // var s = "Your Joined Room ID is : " + roomID;
    // crb.innerHTML = s;
    // getStream(roomID);
})




