"""
Code Change Event Handler

Handles the code_change event for the classroom coding platform.
Receives code updates from students and syncs them to the teacher.
"""


async def handle_code_change(sid, sio, rooms, data):
    """
    Handle code_change event from students
    
    Args:
        sid: The student socket's ID
        sio: SocketIO server instance for emitting events
        rooms: Reference to in-memory rooms state dictionary
        data: Event data containing roomId and code
    """
    # Extract roomId and code from event data
    room_id = data.get('roomId')
    code = data.get('code')
    
    if not room_id or code is None:
        print(f'[CODE_CHANGE] Error: Missing roomId or code from socket {sid}')
        return
    
    # Validate room exists
    if room_id not in rooms:
        print(f'[CODE_CHANGE] Error: Room {room_id} does not exist')
        return
    
    room = rooms[room_id]
    
    # Validate socket is a student in that room
    if sid not in room['students']:
        # Not a student - silently ignore event and return
        print(f'[CODE_CHANGE] Ignored: Socket {sid} is not a student in room {room_id}')
        return
    
    # Update student's code in room state
    room['students'][sid]['code'] = code
    
    # Get teacher socket ID
    teacher_socket_id = room['teacher']
    
    # Emit code_update event to teacher socket only with studentId and code
    await sio.emit('code_update', 
                  {'studentId': sid, 'code': code}, 
                  room=teacher_socket_id)
    
    print(f'[CODE_CHANGE] Student {sid} updated code in room {room_id}')
