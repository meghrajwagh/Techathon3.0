import socketio
import asyncio

# Create a Socket.IO client
sio = socketio.AsyncClient()

@sio.event
async def connect():
    print('✓ Connected to server')
    
    # Test code execution
    print('\n→ Testing code execution...')
    await sio.emit('run_code', {
        'code': 'print("Hello from Docker!")',
        'timeout': 10
    })

@sio.event
async def code_result(data):
    print('✓ Code execution result:')
    print(f'  Exit code: {data.get("exit_code")}')
    print(f'  Output: {data.get("output")}')
    if 'error' in data:
        print(f'  Error: {data.get("error")}')
    await sio.disconnect()

@sio.event
async def disconnect():
    print('✓ Disconnected from server')

async def main():
    try:
        await sio.connect('http://localhost:8000')
        await sio.wait()
    except Exception as e:
        print(f'✗ Error: {e}')

if __name__ == '__main__':
    asyncio.run(main())
