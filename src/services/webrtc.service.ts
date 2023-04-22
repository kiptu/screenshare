import { io } from "socket.io-client";

// Socket.io
export const socket = io("ws://127.0.0.1:5024", { autoConnect: false });

socket.on("data", (data: any) => {
  handleSignalingData(data);
});

socket.on("ready", (msg: any) => {
  peers[msg.sid] = createPeerConnection();
  sendOffer(msg.sid);
  addPendingCandidates(msg.sid);
});

// Global
let room: string;
let localStream: MediaStream;
const peers: RTCPeerConnection[] = [];
const pendingCandidates: any[] = [];

const sendData = (data: any) => {
  socket.emit("data", data);
};

const createPeerConnection = () => {
  const pc = new RTCPeerConnection({});
  pc.onicecandidate = onIceCandidate;
  pc.addEventListener("addstream", (event: any) => onAddStream(event), false);
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
  }
  return pc;
};

const sendOffer = (sid: any) => {
  peers[sid].createOffer().then(
    (sdp) => setAndSendLocalDescription(sid, sdp),
    (error: any) => {
      console.error("Send offer failed: ", error);
    }
  );
};

const sendAnswer = (sid: any) => {
  peers[sid].createAnswer().then(
    (sdp) => setAndSendLocalDescription(sid, sdp),
    (error: any) => {
      console.error("Send answer failed: ", error);
    }
  );
};

const setAndSendLocalDescription = (sid: any, sessionDescription: any) => {
  peers[sid].setLocalDescription(sessionDescription);
  sendData({
    sid,
    type: sessionDescription.type,
    sdp: sessionDescription.sdp,
    room: room
  });
};

const onIceCandidate = (event: any) => {
  if (event.candidate) {
    sendData({
      type: "candidate",
      candidate: event.candidate,
      room: room
    });
  }
};

const onAddStream = (event: any) => {
  const newRemoteStreamElem = document.createElement("video");
  newRemoteStreamElem.autoplay = true;
  newRemoteStreamElem.muted = true;
  newRemoteStreamElem.srcObject = event.stream;

  const streams = document.querySelector("#remote-streams");
  if (streams != null) {
    streams.appendChild(newRemoteStreamElem);
  }
};

const addPendingCandidates = (sid: any) => {
  if (sid in pendingCandidates) {
    pendingCandidates[sid].forEach((candidate: RTCIceCandidateInit) => {
      peers[sid].addIceCandidate(new RTCIceCandidate(candidate));
    });
  }
};

const handleSignalingData = (data: any) => {
  const sid = data.sid;
  delete data.sid;
  switch (data.type) {
    case "offer":
      peers[sid] = createPeerConnection();
      peers[sid].setRemoteDescription(new RTCSessionDescription(data));
      sendAnswer(sid);
      addPendingCandidates(sid);
      break;
    case "answer":
      peers[sid].setRemoteDescription(new RTCSessionDescription(data));
      break;
    case "candidate":
      if (sid in peers) {
        peers[sid].addIceCandidate(new RTCIceCandidate(data.candidate));
      } else {
        if (!(sid in pendingCandidates)) {
          pendingCandidates[sid] = [];
        }
        pendingCandidates[sid].push(data.candidate);
      }
      break;
  }
};

// Exports
export const setRoom = (name: string) => {
  room = name;
};

export const getRoom = () => {
  return room;
};

export const startStream = async () => {
  await navigator.mediaDevices
    .getDisplayMedia({
      video: true,
      audio: false
    })
    .then((stream: MediaStream) => {
      localStream = stream;
    })
    .catch((error: any) => {
      console.error("Stream not found: ", error);
    });

  return !!localStream;
};

export const uuidv4 = () => {
  return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c: any) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};
