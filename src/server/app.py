import socketio
import uvicorn
from starlette.applications import Starlette

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
starlette_app = Starlette(debug=True)
app = socketio.ASGIApp(sio, starlette_app)

@sio.event
async def message(sid, data):
    if data["type"] == "join":
        sio.enter_room(sid, data["room"])
        await sio.emit("ready", {"sid": sid}, room=data["room"], skip_sid=sid)
    if data["type"] == "leave":
        sio.leave_room(sid, data["room"])

@sio.event
async def data(sid, data):
    peerToSend = None
    if "sid" in data:
        peerToSend = data["sid"]
    data["sid"] = sid
    await sio.emit("data", data, room=peerToSend if peerToSend else data["room"], skip_sid=sid)

def main():
    uvicorn.run(app, host="0.0.0.0", port=5024)

main()