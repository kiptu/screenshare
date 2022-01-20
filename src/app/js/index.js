import { socket, startStream, uuidv4, getRoom, setRoom } from "./webrtc";

// Dom elements
const startBtn = document.getElementById("start-stream");
const stopBtn = document.getElementById("stop-stream");

let createRoomUrl = () => {
    const url = "watch.html?room="  + getRoom();

    document.getElementById("room-name").innerHTML = "Your personal Stream URL: " + "<a href='" + url + "' target='_blank'>Click here</a>";
}

let stopStream = () => {
    destroyRoom();
}

let destroyRoom = () => {
    socket.emit("message", {type: "leave", room: getRoom()});
    socket.disconnect();

    location.reload();
}

let createRoom = () => {
    socket.connect();
    setRoom(uuidv4());
    socket.emit("message", {type: "join", room: getRoom()});
    
    createRoomUrl();
    toggleButtons();
}

let toggleButtons = () => {
    startBtn.style.display = "none";
    stopBtn.style.display = "block"
}

let clickedStart = () => {
    startStream().then(result => {
        if(result) {
            createRoom();
        }
    });
}

let clickedStop = () => {
    stopStream();
}

const main = () => {
    startBtn.addEventListener("click", clickedStart);
    stopBtn.addEventListener("click", clickedStop);
}
window.onload = main;