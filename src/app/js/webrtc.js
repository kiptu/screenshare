import { io } from "socket.io-client";

// Socket.io
export const socket = io("ws://127.0.0.1:5024", { autoConnect: false });

socket.on("data", (data) => {
    handleSignalingData(data);
});

socket.on("ready", (msg) => {
    peers[msg.sid] = createPeerConnection();
    sendOffer(msg.sid);
    addPendingCandidates(msg.sid);
});

// Global
let room;
let peers = {};
let pendingCandidates = {};
let localStream;

let sendData = (data) => {
    socket.emit("data", data);
};

let createPeerConnection = () => {
    const pc = new RTCPeerConnection({});
    pc.onicecandidate = onIceCandidate;
    pc.onaddstream = onAddStream;
    if(localStream) {
        pc.addStream(localStream);
    }
    return pc;
};

let sendOffer = (sid) => {
    peers[sid].createOffer().then(
        (sdp) => setAndSendLocalDescription(sid, sdp),
        (error) => {
            console.error("Send offer failed: ", error);
        }
    );
};

let sendAnswer = (sid) => {
    peers[sid].createAnswer().then(
        (sdp) => setAndSendLocalDescription(sid, sdp),
        (error) => {
            console.error("Send answer failed: ", error);
        }
    );
};

let setAndSendLocalDescription = (sid, sessionDescription) => {
    peers[sid].setLocalDescription(sessionDescription);
    sendData({sid, type: sessionDescription.type, sdp: sessionDescription.sdp, room: room});
};

let onIceCandidate = (event) => {
    if (event.candidate) {
        sendData({
            type: "candidate",
            candidate: event.candidate,
            room: room
        });
    }
};

let onAddStream = (event) => {
    const newRemoteStreamElem = document.createElement("video");
    newRemoteStreamElem.autoplay = true;
    newRemoteStreamElem.muted = true;
    newRemoteStreamElem.srcObject = event.stream;
    document.querySelector("#remote-streams").appendChild(newRemoteStreamElem);
};

let addPendingCandidates = (sid) => {
    if (sid in pendingCandidates) {
        pendingCandidates[sid].forEach(candidate => {
            peers[sid].addIceCandidate(new RTCIceCandidate(candidate))
        });
    }
}

let handleSignalingData = (data) => {
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
                pendingCandidates[sid].push(data.candidate)
            }
            break;
    }
};

// Exports
export let setRoom = (name) => {
    room = name;
}

export let getRoom = () => {
    return room;
}

export let startStream = async () => {
    await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
    })
    .then((stream) => {
        localStream = stream;
    })
    .catch(error => {
        console.error("Stream not found: ", error);
    });

    return !!localStream;
}

export let uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}