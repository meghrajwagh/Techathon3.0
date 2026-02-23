"""
Classroom Coding Platform Backend Server

A real-time classroom coding platform backend that enables teachers to monitor
student code in real-time within a single room using FastAPI and python-socketio.
"""

import os
import time
import asyncio
import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.execution.execution import run_code as execute_code
from app.execution.execution import start_interactive, send_input, stop_process

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
# Structure: {roomId: {teacher: socketId, students: {...}, mainView: {...}, start_time: float}}
rooms = {}

# Store disconnected student data by (roomId, userName) for rejoin support
# Structure: {(roomId, userName): {code, output, error}}
disconnected_students = {}

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
    """Handle disconnect event - save student data, end room if teacher leaves"""
    # Check if this sid is a teacher — if so, end the entire room
    for room_id, room_data in list(rooms.items()):
        if room_data.get('teacher') == sid:
            print(f'[DISCONNECT] Teacher {sid} disconnected — ending room {room_id}')
            # Notify all students that the session has ended
            await sio.emit('room_closed', {
                'message': 'The host has ended the session.'
            }, room=room_id)
            # Disconnect all students
            for student_sid in list(room_data.get('students', {}).keys()):
                try:
                    await sio.disconnect(student_sid)
                except Exception:
                    pass
            # Clean up room
            del rooms[room_id]
            print(f'[DISCONNECT] Room {room_id} deleted')
            return

    # Save student data for potential rejoin
    for room_id, room_data in rooms.items():
        if sid in room_data.get('students', {}):
            student = room_data['students'][sid]
            key = (room_id, student.get('name', ''))
            disconnected_students[key] = {
                'code': student.get('code', ''),
                'output': student.get('output', ''),
                'error': student.get('error', None)
            }
            print(f'[DISCONNECT] Saved data for student "{student.get("name", "")}" in room {room_id}')
            break
    if handlers_available:
        await handle_disconnect(sid, sio, rooms)

@sio.event
async def run_code(sid, data):
    code = data.get("code")
    timeout = data.get("timeout", 30)
    language = data.get("language", "python")

    # Collect all output and error for the final result
    collected_output = []
    collected_error = []

    async def on_output(text, is_error):
        """Stream each line of output to the client in real-time."""
        if is_error:
            collected_error.append(text)
        else:
            collected_output.append(text)
        # Send incremental output to the user
        await sio.emit('code_output', {
            'text': text,
            'isError': is_error
        }, to=sid)

    async def on_done(exit_code):
        """Called when the process finishes."""
        full_output = ''.join(collected_output)
        full_error = ''.join(collected_error)
        result = {
            'exit_code': exit_code,
            'output': full_output,
            'error': full_error if exit_code != 0 else None
        }
        await sio.emit('code_done', result, to=sid)

        # Forward to teacher if this is a student
        for room_id, room_data in rooms.items():
            if sid in room_data.get('students', {}):
                room_data['students'][sid]['output'] = full_output
                room_data['students'][sid]['error'] = full_error if exit_code != 0 else None
                teacher_sid = room_data.get('teacher')
                if teacher_sid:
                    await sio.emit('student_output', {
                        'studentId': sid,
                        'output': full_output,
                        'error': full_error if exit_code != 0 else None
                    }, to=teacher_sid)
                break

    # Start interactive execution (streams output)
    asyncio.create_task(
        start_interactive(code, sid, timeout, language, on_output, on_done)
    )


@sio.event
async def code_input(sid, data):
    """Handle user input for interactive programs (e.g. input() in Python)."""
    text = data.get('text', '')
    success = await send_input(sid, text)
    if success:
        print(f'[CODE_INPUT] Sent input to process for {sid}: {repr(text)}')
    else:
        print(f'[CODE_INPUT] No running process for {sid}')


@sio.event
async def stop_code(sid, data=None):
    """Stop a running code execution."""
    await stop_process(sid)
    await sio.emit('code_done', {
        'exit_code': -1,
        'output': '',
        'error': '\n🛑 Execution stopped by user'
    }, to=sid)
    print(f'[STOP_CODE] Stopped execution for {sid}')


if handlers_available:
    @sio.event
    async def join_room(sid, data):
        """Handle join_room event with rejoin support"""
        room_id = data.get('roomId', '')
        user_name = data.get('userName', '')
        
        await handle_join_room(sid, sio, rooms, data)
        
        # Restore saved data if student is rejoining
        key = (room_id, user_name)
        if key in disconnected_students and sid in rooms.get(room_id, {}).get('students', {}):
            saved = disconnected_students.pop(key)
            rooms[room_id]['students'][sid]['code'] = saved.get('code', '')
            rooms[room_id]['students'][sid]['output'] = saved.get('output', '')
            rooms[room_id]['students'][sid]['error'] = saved.get('error', None)
            # Send the restored code back to the student
            await sio.emit('restore_code', {
                'code': saved.get('code', ''),
                'output': saved.get('output', ''),
            }, to=sid)
            print(f'[REJOIN] Restored data for student "{user_name}" in room {room_id}')

        # Send timer sync to the newly joined student
        room = rooms.get(room_id)
        if room and room.get('timer_remaining') is not None:
            elapsed_since_update = time.time() - room.get('timer_updated_at', time.time())
            adjusted_time = max(0, int(room['timer_remaining'] - elapsed_since_update))
            await sio.emit('timer_sync', {
                'timeRemaining': adjusted_time,
                'serverTime': time.time()
            }, to=sid)
            print(f'[TIMER] Sent timer sync to new student {sid}: {adjusted_time}s remaining')
    
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
    
    @sio.event
    async def teacher_code_change(sid, data):
        """Handle teacher code change and broadcast to students"""
        # Find which room the teacher is in
        for room_id, room_data in rooms.items():
            if room_data.get('teacher') == sid:
                # Broadcast to all students in the room
                for student_sid in room_data.get('students', {}).keys():
                    await sio.emit('teacher_code_change', {
                        'code': data.get('code', '')
                    }, to=student_sid)
                print(f'[TEACHER_CODE_CHANGE] Broadcasted code to {len(room_data.get("students", {}))} students in room {room_id}')
                break
    
    @sio.event
    async def teacher_output(sid, data):
        """Handle teacher output and broadcast to students"""
        # Find which room the teacher is in
        for room_id, room_data in rooms.items():
            if room_data.get('teacher') == sid:
                # Broadcast to all students in the room
                for student_sid in room_data.get('students', {}).keys():
                    await sio.emit('teacher_output', {
                        'output': data.get('output', ''),
                        'error': data.get('error', None)
                    }, to=student_sid)
                print(f'[TEACHER_OUTPUT] Broadcasted output to {len(room_data.get("students", {}))} students in room {room_id}')
                break
    
    @sio.event
    async def teacher_edit_student_code(sid, data):
        """Handle teacher editing a student's code and forward to that student"""
        student_id = data.get('studentId')
        code = data.get('code', '')
        
        for room_id, room_data in rooms.items():
            if room_data.get('teacher') == sid:
                if student_id in room_data.get('students', {}):
                    # Update code in server state
                    room_data['students'][student_id]['code'] = code
                    # Forward the edit to the student
                    await sio.emit('teacher_edit_code', {'code': code}, to=student_id)
                    print(f'[TEACHER_EDIT] Teacher {sid} edited student {student_id} code in room {room_id}')
                break
    
    @sio.event
    async def teacher_take_control(sid, data):
        """Handle teacher taking control of student's editor"""
        student_id = data.get('studentId')
        for room_id, room_data in rooms.items():
            if room_data.get('teacher') == sid:
                if student_id in room_data.get('students', {}):
                    await sio.emit('teacher_take_control', {}, to=student_id)
                    print(f'[CONTROL] Teacher took control of student {student_id}')
                break
    
    @sio.event
    async def teacher_release_control(sid, data):
        """Handle teacher releasing control of student's editor"""
        student_id = data.get('studentId')
        for room_id, room_data in rooms.items():
            if room_data.get('teacher') == sid:
                if student_id in room_data.get('students', {}):
                    await sio.emit('teacher_release_control', {}, to=student_id)
                    print(f'[CONTROL] Teacher released control of student {student_id}')
                break
    
    @sio.event
    async def validate_room(sid, data):
        """Check if a room exists (teacher has created it)"""
        room_id = data.get('roomId', '')
        exists = room_id in rooms and rooms[room_id].get('teacher') is not None
        return {'valid': exists, 'roomId': room_id}

    @sio.event
    async def leave_room(sid, data=None):
        """Explicit leave — if teacher, end the entire session."""
        for room_id, room_data in list(rooms.items()):
            if room_data.get('teacher') == sid:
                print(f'[LEAVE_ROOM] Teacher {sid} explicitly ending room {room_id}')
                await sio.emit('room_closed', {
                    'message': 'The host has ended the session.'
                }, room=room_id)
                for student_sid in list(room_data.get('students', {}).keys()):
                    try:
                        await sio.disconnect(student_sid)
                    except Exception:
                        pass
                del rooms[room_id]
                print(f'[LEAVE_ROOM] Room {room_id} deleted')
                return
            elif sid in room_data.get('students', {}):
                # Student leaving — just remove them
                student = room_data['students'].pop(sid, {})
                teacher_sid = room_data.get('teacher')
                if teacher_sid:
                    await sio.emit('student_list_update', {
                        'students': room_data['students']
                    }, to=teacher_sid)
                print(f'[LEAVE_ROOM] Student {sid} ({student.get("name", "")}) left room {room_id}')
                return

    @sio.event
    async def sync_timer(sid, data):
        """Teacher broadcasts timer state to all students in the room."""
        for room_id, room_data in rooms.items():
            if room_data.get('teacher') == sid:
                time_remaining = data.get('timeRemaining', 0)
                # Store in room data for new joiners
                room_data['timer_remaining'] = time_remaining
                room_data['timer_updated_at'] = time.time()
                # Broadcast to all students
                for student_sid in room_data.get('students', {}).keys():
                    await sio.emit('timer_sync', {
                        'timeRemaining': time_remaining,
                        'serverTime': time.time()
                    }, to=student_sid)
                break

    @sio.event
    async def share_student_code(sid, data):
        """Teacher shares a student's code with all students in the room."""
        for room_id, room_data in rooms.items():
            if room_data.get('teacher') == sid:
                for student_sid in room_data.get('students', {}).keys():
                    await sio.emit('shared_code', {
                        'code': data.get('code', ''),
                        'label': data.get('label', 'Shared Code')
                    }, to=student_sid)
                print(f'[SHARE] Teacher shared student code to {len(room_data.get("students", {}))} students in room {room_id}')
                break

    @sio.event
    async def unshare_student_code(sid, data=None):
        """Teacher stops sharing — tell students to revert to teacher's code."""
        for room_id, room_data in rooms.items():
            if room_data.get('teacher') == sid:
                for student_sid in room_data.get('students', {}).keys():
                    await sio.emit('unshare_code', {}, to=student_sid)
                print(f'[UNSHARE] Teacher unshared code in room {room_id}')
                break


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
