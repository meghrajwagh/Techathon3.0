"""
Promote Student Event Handler

Handles the promote_student event for the classroom coding platform.
Allows teachers to promote a student's code to the main view.
"""


async def handle_promote_student(sid, sio, rooms, data):
    """
    Handle promote_student event from teacher
    
    Args:
        sid: The teacher socket's ID
        sio: SocketIO server instance for emitting events
        rooms: Reference to in-memory rooms state dictionary
        data: Event data containing roomId and studentId
    """
    # Extract roomId and studentId from event data
    room_id = data.get('roomId')
    student_id = data.get('studentId')
    
    if not room_id or not student_id:
        print(f'[PROMOTE_STUDENT] Error: Missing roomId or studentId from socket {sid}')
        return
    
    # Validate room exists
    if room_id not in rooms:
        print(f'[PROMOTE_STUDENT] Error: Room {room_id} does not exist')
        return
    
    room = rooms[room_id]
    
    # Validate socket is the teacher
    if sid != room['teacher']:
        # Not teacher - silently ignore event and return
        print(f'[PROMOTE_STUDENT] Ignored: Socket {sid} is not the teacher in room {room_id}')
        return
    
    # Update mainView to promote student
    room['mainView'] = {
        'type': 'student',
        'studentId': student_id
    }
    
    # Broadcast main_view_update to all sockets in room
    await sio.emit('main_view_update', 
                  {'type': 'student', 'studentId': student_id}, 
                  room=room_id)
    
    print(f'[PROMOTE_STUDENT] Teacher {sid} promoted student {student_id} in room {room_id}')
