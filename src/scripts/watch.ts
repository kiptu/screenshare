import { socket, getRoom, setRoom } from "../services/webrtc.service";

const joinRoom = () => {
  socket.connect();
  socket.emit("message", { type: "join", room: getRoom() });
};

const watchStream = () => {
  joinRoom();
};

const main = () => {
  const url = new URL(window.location.href);
  const roomParam = url.searchParams.get("room");

  // If parameter room is set
  if (roomParam != null) {
    setRoom(roomParam);
    watchStream();
  }
};
window.onload = main;
