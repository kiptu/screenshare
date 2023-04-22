import {
  socket,
  startStream,
  uuidv4,
  getRoom,
  setRoom
} from "../services/webrtc.service";

// Dom elements
const startBtn = document.getElementById("start-stream");
const stopBtn = document.getElementById("stop-stream");

const createRoomUrl = () => {
  const url = "watch.html?room=" + getRoom();

  const roomName = document.getElementById("room-name");

  if (roomName != null) {
    roomName.innerHTML =
      "Your personal Stream URL: " +
      "<a href='" +
      url +
      "' target='_blank'>Click here</a>";
  }
};

const stopStream = () => {
  destroyRoom();
};

const destroyRoom = () => {
  socket.emit("message", { type: "leave", room: getRoom() });
  socket.disconnect();

  location.reload();
};

const createRoom = () => {
  socket.connect();
  setRoom(uuidv4());
  socket.emit("message", { type: "join", room: getRoom() });

  createRoomUrl();
  toggleButtons();
};

const toggleButtons = () => {
  if (startBtn != null && stopBtn != null) {
    startBtn.style.display = "none";
    stopBtn.style.display = "block";
  }
};

const clickedStart = () => {
  startStream().then((result) => {
    if (result) {
      createRoom();
    }
  });
};

const clickedStop = () => {
  stopStream();
};

const main = () => {
  if (startBtn != null && stopBtn != null) {
    startBtn.addEventListener("click", clickedStart);
    stopBtn.addEventListener("click", clickedStop);
  }
};
window.onload = main;
