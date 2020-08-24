let Peer = require('simple-peer')
const { v4: uuidv4 } = require('uuid');
let socket = io()
let roomID = "foobar";
let peersRef = [];

function initialization() {
    
    M.AutoInit();
    // var sidenav_elems = document.querySelectorAll(".sidenav");
    // // var createRoom_btn = document.querySelector(".create_btn");
    // // var carousel_elem = document.querySelector("#events .carousel");
    // // var image_elems = document.querySelectorAll(".materialboxed");
    // var scrollspy_elems = document.querySelectorAll(".scrollspy");
    // var sidenav_options = { edge: "left" };
    // // var carousel_options = { numVisible: 5, indicators: true, padding: 30, shift: 0, dist: -10 };
    // // var images_options = {};
    // var scrollspy_options = {};
    // var sideNavs = M.Sidenav.init(sidenav_elems, sidenav_options);
    // // var carousel = M.Carousel.init(carousel_elem, carousel_options);
    // // var images = M.Materialbox.init(image_elems, images_options);
    // var instances = M.ScrollSpy.init(scrollspy_elems, scrollspy_options);
    // // createRoom_btn.addEventListener('click', function () {
    // //     //console.log("create btn pressed");
    // // })
}

document.addEventListener("DOMContentLoaded", function () {
    initialization();
});


const localVideo = document.getElementById("local-video");
// const createRoom = document.querySelector('#createRoomButton');
// const joinRoom = document.querySelector('#joinRoomButton');
const endCallButton = document.querySelector('#endCallButton');
const crb = document.getElementById("crbtext");

endCallButton.addEventListener('click', endCall)

getStream(roomID);

function endCall() {
    //console.log("asking for ending the  call");
    peersRef.forEach(p => {
        //console.log(p.peerID);
        socket.emit("endCall", { for: p.peerID, from: socket.id });
        p.peer.destroy();
    })
    let remoteVideoDiv = document.getElementById("vframeR");
    if (remoteVideoDiv) {
        remoteVideoDiv.remove();   
    }
    endCallButton.setAttribute("href","/");
}


// createRoom.addEventListener('click', () => {
//     roomID = uuidv4();
//     //console.log(crb);
//     crb.innerHTML = "";
//     var s = "Your Room ID is : " + roomID;
//     crb.innerHTML = s;
//     getStream(roomID);
// });

// joinRoom.addEventListener('click', () => {
//     roomID = document.querySelector('#roomID').value;
//     document.querySelector('#roomID').value = "";
//     crb.innerHTML = "";
//     var s = "Your Joined Room ID is : " + roomID;
//     crb.innerHTML = s;
//     getStream(roomID);
// })



function getStream(roomID) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {

            // cretaeRoom.addEventListener('click', () => {
            //     roomID = uuidv4();
            // });
            // joinRoom.addEventListener('click', () => {
            //     roomID = document.querySelector('#roomID').nodeValue();
            // });
            if (localVideo) {
                localVideo.srcObject = stream;
            }

            // localVideo.addEventListener('hover', function () { 
            //     document.getElementById("end-call").visi
            // })




            //console.log("checking roomID -> ", roomID);
            socket.emit("join room", roomID);
            socket.on("all users", users => {
                //console.log("create peer for -> ", users);
                const peersForThisUser = [];
                if (users) {
                    users.forEach(userID => {
                        const peer = createPeer(userID, socket.id, stream);
                        peersRef.push({
                            peerID: userID,
                            peer,
                        })
                        peersForThisUser.push(peer);
                    })
                }
                //console.log(socket.id, "-> peersRef:-> ", peersRef);
                //console.log("peersForThisUser:-> ", peersForThisUser);
                // setPeers(peers);
            });

            socket.on("user joined", payload => {
                console.log("user joined is calling addPeer");
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.push({
                    peerID: payload.callerID,
                    peer,
                })
                //console.log("user joined ->", payload);
                // setPeer(user => [...users, peer]);
            });

            socket.on("receiving returned signal", payload => {
                //console.log("rrs---> ", peersRef);
                const item = peersRef.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
                //console.log("receiving returned signal ->", payload);
            });

            socket.on("room full", () => {
                document.write("Room is full try again later!");
            });

            socket.on("remove div", user => {
                //console.log("remove div vala", user);
                deleteUser(user)
            })

        })
        .catch(err => document.write(err))
}

function deleteUser(userID) {
    //console.log("I reached here");
    //console.log("para are -> ", userID);
    const elements = document.getElementsByClassName(userID);
    while (elements.length > 0) elements[0].remove();
}


function CreateVideo(stream, callerID) {
    console.log("create video with:-> for->",callerID,socket.id);
    let localVideoDiv = document.createElement('div')
    localVideoDiv.id = 'vframeR'
    var c = callerID;
    var s = 'card grey darken-3 video-container ' + c;
    //console.log(s);
    localVideoDiv.setAttribute('class', s);
    document.querySelector('#videos').appendChild(localVideoDiv)
    let video = document.createElement('video')
    video.id = 'remote-video'
    // video.setAttribute('class', 'center')
    // video.setAttribute('width', "100%");
    // video.setAttribute('height', "100%");
    localVideoDiv.appendChild(video)
    video.srcObject = stream
    video.play()
    // const remoteVideo = document.getElementById("remote-video");
    // if (remoteVideo) {
    //     remoteVideo.srcObject = stream;
    // }
    //console.log("createVideo");
}

function createPeer(userToSignal, callerID, stream) {
    console.log("createPeer is calling signal");
    //console.log("para of createPeer are -> ", userToSignal, callerID);
    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
    });
    peer.on("stream", stream => {
        CreateVideo(stream, userToSignal);
    });
    peer.on("signal", signal => {
        console.log("signal is calling sending signal");
        socket.emit("sending signal", { userToSignal, callerID, signal })
    })
    //console.log("createPeer");
    return peer;
}


function addPeer(incomingSignal, callerID, stream) {
    //console.log("para of addPeer are -> ", incomingSignal, callerID)
    const peer = new Peer({
        initiator: false,
        trickle: false,
        stream, 
    });
    peer.on("stream", stream => {
        CreateVideo(stream, callerID);
    });
    peer.on("signal", signal => {
        socket.emit("returning signal", { signal, callerID });
    })
    peer.signal(incomingSignal);

    //console.log("addPeer");
    return peer;
}

// function generateRoomID() {

// }

// function getRoomID() {
// }