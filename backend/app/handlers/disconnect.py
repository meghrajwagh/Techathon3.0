"""
Disconnect Event Handler

Handles the disconnect event for the classroom coding platform.
Manages cleanup when students or teachers disconnect from rooms.
"""


async def handle_disconnect(sid, sio, rooms):
    """
    Handle disconnect event
    
    Args:
        sid: The disconnecting socket's ID
        sio: SocketIO server instance for emitting events
        rooms: Reference to in-memory rooms state dictionary
    """
    # Iterate through rooms to find which room socket belongs to
    room_id = None
    is_teacher = False
    
    for rid, room in rooms.items():
        # Check if socket is the teacher
        if room['teacher'] == sid:
            room_id = rid
            is_teacher = True
            break
        # Check if socket is a student
        elif sid in room['students']:
            room_id = rid
            is_teacher = False
            break
    
    # Socket not found in any room
    if room_id is None:
        print(f'[DISCONNECT] Socket {sid} disconnected (not in any room)')
        return
    
    room = rooms[room_id]
    
    if is_teacher:
        # Teacher disconnect - delete room and notify all students
        print(f'[DISCONNECT] Teacher {sid} disconnected from room {room_id}')
        
        # Emit room_closed to all students in room
        await sio.emit('room_closed', 
                      {'message': 'Teacher has left the room'}, 
                      room=room_id)
        
        # Disconnect all student sockets
        for student_id in list(room['students'].keys()):
            await sio.disconnect(student_id)
        
        # Delete room from rooms dict
        del rooms[room_id]
        
        print(f'[DISCONNECT] Room {room_id} deleted')
    
    else:
        # Student disconnect - remove from students and update teacher
        print(f'[DISCONNECT] Student {sid} disconnected from room {room_id}')
        
        # Check if student is in mainView
        main_view_reset = False
        if room['mainView']['type'] == 'student' and room['mainView']['studentId'] == sid:
            # Reset mainView to teacher
            room['mainView'] = {
                'type': 'teacher',
                'studentId': None
            }
            main_view_reset = True
            print(f'[DISCONNECT] MainView reset to teacher in room {room_id}')
        
        # Remove student from students dict
        del room['students'][sid]
        
        # Emit student_list_update to teacher
        teacher_socket_id = room['teacher']
        await sio.emit('student_list_update', 
                      {'students': room['students']}, 
                      room=teacher_socket_id)
        
        # Broadcast main_view_update if mainView was reset
        if main_view_reset:
            await sio.emit('main_view_update', 
                          {'type': 'teacher', 'studentId': None}, 
                          room=room_id)
