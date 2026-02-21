"""
Open Student Event Handler

Handles the open_student event for the classroom coding platform.
Allows teachers to retrieve a specific student's data (name, code, output).
"""


async def handle_open_student(sid, sio, rooms, data):
    """
    Handle open_student event from teacher
    
    Args:
        sid: The teacher socket's ID
        sio: SocketIO server instance for emitting events
        rooms: Reference to in-memory rooms state dictionary
        data: Event data containing roomId and studentId
        
    Returns:
        Student data dict or error dict (for callback support)
    """
    # Extract roomId and studentId from event data
    room_id = data.get('roomId')
    student_id = data.get('studentId')
    
    if not room_id or not student_id:
        print(f'[OPEN_STUDENT] Error: Missing roomId or studentId from socket {sid}')
        return {'error': 'Missing roomId or studentId'}
    
    # Validate room exists
    if room_id not in rooms:
        print(f'[OPEN_STUDENT] Error: Room {room_id} does not exist')
        return {'error': 'Room not found'}
    
    room = rooms[room_id]
    
    # Validate socket is the teacher
    if sid != room['teacher']:
        # Not teacher - silently ignore event and return
        print(f'[OPEN_STUDENT] Ignored: Socket {sid} is not the teacher in room {room_id}')
        return None
    
    # Check if studentId exists in room's students
    if student_id not in room['students']:
        # Student not found - return error
        print(f'[OPEN_STUDENT] Error: Student {student_id} not found in room {room_id}')
        return {'error': 'Student not found'}
    
    # Student exists - return student data
    student_data = room['students'][student_id]
    print(f'[OPEN_STUDENT] Teacher {sid} opened student {student_id} in room {room_id}')
    
    return {
        'name': student_data['name'],
        'code': student_data['code'],
        'output': student_data['output']
    }
