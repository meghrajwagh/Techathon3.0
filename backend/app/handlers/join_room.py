"""
Join Room Event Handler

Handles the join_room event for the classroom coding platform.
Creates rooms, assigns roles (teacher/student), and manages room state.
"""


async def handle_join_room(sid, sio, rooms, data):
    """
    Handle join_room event
    
    Args:
        sid: The connecting socket's ID
        sio: SocketIO server instance for emitting events
        rooms: Reference to in-memory rooms state dictionary
        data: Event data containing roomId and optional userName
    """
    # Extract roomId and userName from event data
    room_id = data.get('roomId')
    user_name = data.get('userName', '')
    
    print(f'[JOIN_ROOM] Received join_room event - sid: {sid}, roomId: {room_id}, userName: "{user_name}", data: {data}')
    
    if not room_id:
        print(f'[JOIN_ROOM] Error: No roomId provided by socket {sid}')
        return
    
    # Check if room exists in rooms dictionary
    if room_id not in rooms:
        # Room doesn't exist - create new room with teacher role
        rooms[room_id] = {
            'teacher': sid,
            'students': {},
            'mainView': {
                'type': 'teacher',
                'studentId': None
            }
        }
        
        # Join socket to Socket.io room
        await sio.enter_room(sid, room_id)
        
        # Emit role_assigned event to socket with teacher role
        await sio.emit('role_assigned', {'role': 'teacher'}, room=sid)
        
        print(f'[JOIN_ROOM] Room {room_id} created. Teacher: {sid} (name: "{user_name}")')
    
    else:
        # Room exists - assign student role
        # Create student entry with sid as key and user's name
        student_name = user_name if user_name else 'Anonymous'
        rooms[room_id]['students'][sid] = {
            'name': student_name,
            'code': '',
            'output': ''
        }
        
        # Join socket to Socket.io room
        await sio.enter_room(sid, room_id)
        
        # Emit role_assigned event to socket with student role
        await sio.emit('role_assigned', {'role': 'student'}, room=sid)
        
        # Note: Teacher's current code will be sent by the teacher's frontend
        # when it detects a new student joined (via student count change).
        # Do NOT send empty code here — it overwrites the student's shared view.
        
        # Emit student_list_update to teacher socket with all students
        teacher_socket_id = rooms[room_id]['teacher']
        await sio.emit('student_list_update', 
                      {'students': rooms[room_id]['students']}, 
                      room=teacher_socket_id)
        
        print(f'[JOIN_ROOM] Student {sid} (name: "{student_name}") joined room {room_id}. Total students: {len(rooms[room_id]["students"])}')
        print(f'[JOIN_ROOM] Current students in room: {rooms[room_id]["students"]}')
