import socketio
import uvicorn
from starlette.applications import Starlette

# Create socketio server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app = socketio.ASGIApp(sio, Starlette())

@sio.event
async def message(sid, data):
  # Join room
  if data["type"] == "join":
    sio.enter_room(sid, data["room"])
    await sio.emit("ready", {"sid": sid}, room=data["room"], skip_sid=sid)

  # Leave room
  if data["type"] == "leave":
    sio.leave_room(sid, data["room"])

@sio.event
async def data(sid, data):
  peerTarget = None

  # Get peer to send data to
  if "sid" in data:
    peerTarget = data["sid"]
  
  # Add sender sid to data
  data["sid"] = sid

  # Send data to all peers in room
  await sio.emit("data", data, room=peerTarget if peerTarget else data["room"], skip_sid=sid)

def main():
  # Start server
  uvicorn.run(app, host="0.0.0.0", port=5024)

if __name__ == "__main__":
  main()
