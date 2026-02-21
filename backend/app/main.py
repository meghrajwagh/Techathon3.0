"""
Classroom Coding Platform Backend Server

A real-time classroom coding platform backend that enables teachers to monitor
student code in real-time within a single room using FastAPI and python-socketio.
"""

import os
import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.execution.execution import run_code as execute_code

# Initialize FastAPI application
app = FastAPI(title="Classroom Coding Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Socket.IO server with CORS enabled
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False
)

# Create ASGI application combining FastAPI and Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# In-memory rooms dictionary for state storage
# Structure: {roomId: {teacher: socketId, students: {socketId: {name, code, output}}, mainView: {type, studentId}}}
rooms = {}

# Import event handlers
try:
    from app.handlers.join_room import handle_join_room
    from app.handlers.code_change import handle_code_change
    from app.handlers.open_student import handle_open_student
    from app.handlers.promote_student import handle_promote_student
    from app.handlers.disconnect import handle_disconnect
    handlers_available = True
    print('[SERVER] All handler modules loaded successfully')
except ImportError as e:
    handlers_available = False
    print(f'[SERVER] Warning: Handler import failed: {e}')
    import traceback
    traceback.print_exc()


# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    """Handle new socket connections"""
    print(f'[SERVER] Client connected: {sid}')


@sio.event
async def disconnect(sid):
    """Handle disconnect event"""
    if handlers_available:
        await handle_disconnect(sid, sio, rooms)

@sio.event
async def run_code(sid, data):
    code = data.get("code")
    timeout = data.get("timeout", 30)

    result = await execute_code(code, timeout)

    await sio.emit("code_result", result, to=sid)


if handlers_available:
    @sio.event
    async def join_room(sid, data):
        """Handle join_room event"""
        await handle_join_room(sid, sio, rooms, data)
    
    @sio.event
    async def code_change(sid, data):
        """Handle code_change event"""
        await handle_code_change(sid, sio, rooms, data)
    
    @sio.event
    async def open_student(sid, data):
        """Handle open_student event with callback support"""
        return await handle_open_student(sid, sio, rooms, data)
    
    @sio.event
    async def promote_student(sid, data):
        """Handle promote_student event"""
        await handle_promote_student(sid, sio, rooms, data)


# FastAPI routes (optional - for health checks, etc.)
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Classroom Coding Platform API"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "rooms": len(rooms)}


# Get port from environment variable or default to 3000
PORT = int(os.environ.get('PORT', 3000))

if __name__ == '__main__':
    print(f'[SERVER] Starting classroom coding platform server on port {PORT}')
    uvicorn.run(socket_app, host='0.0.0.0', port=PORT)
