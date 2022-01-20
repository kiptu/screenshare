import { socket, getRoom, setRoom } from "./webrtc";

let joinRoom = () => {
    socket.connect();
    socket.emit("message", {type: "join", room: getRoom()});
}

let watchStream = () => {
    joinRoom();
}

const main = () => {
    const url = new URL(window.location.href);
    const roomParam = url.searchParams.get("room");

    // If parameter room is set
    if(roomParam != null) {
        setRoom(roomParam);
        watchStream();
    }
}
window.onload = main;