# ORCA - Collaborative Coding Platform

<div align="center">

![ORCA Logo](frontend/src/assets/earth.jpg)

**Real-time collaborative coding environment for classrooms and teams**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8+-black.svg)](https://socket.io/)

</div>

---

## 📖 Overview

**ORCA** (Online Real-time Collaborative Arena) is a modern web-based platform designed for educators and teams to facilitate real-time collaborative coding sessions. Teachers can monitor student code in real-time, share their screen, take control of student editors, and execute code remotely - all within a sleek, IDE-like interface.

### ✨ Key Features

- 🎯 **Real-time Code Synchronization** - See student code changes as they type
- 👨‍🏫 **Teacher Controls** - Take control of student editors, share your code, and broadcast output
- 🚀 **Live Code Execution** - Run Python code with real-time output streaming
- 💬 **Interactive Terminal** - Support for `input()` and interactive programs
- ⏱️ **Session Timer** - 1-hour countdown synchronized across all participants
- 🎨 **Modern UI** - Clean, dark-themed interface inspired by VS Code
- 🔒 **Session-based Rooms** - Secure, isolated coding environments
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔄 **Auto-reconnect** - Seamless recovery from network interruptions
- 💾 **State Persistence** - Code and session state preserved on page refresh

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Teacher    │  │   Student    │  │   Monaco     │      │
│  │  Dashboard   │  │  Dashboard   │  │   Editor     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│                    Socket.IO Client                          │
└───────────────────────────┼──────────────────────────────────┘
                            │
                    WebSocket Connection
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    Socket.IO Server                          │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────┐        │
│  │         Backend (FastAPI + Socket.IO)           │        │
│  │  ┌──────────────┐  ┌──────────────┐            │        │
│  │  │   Room       │  │   Code       │            │        │
│  │  │  Management  │  │  Execution   │            │        │
│  │  └──────────────┘  └──────────────┘            │        │
│  └─────────────────────────────────────────────────┘        │
│                           │                                  │
│                    Docker Runtime                            │
└───────────────────────────┼──────────────────────────────────┘
                            │
                    Code Execution in Containers
```

### Tech Stack

**Frontend:**
- React 18.3 with Vite
- Zustand for state management
- Monaco Editor (VS Code editor)
- Socket.IO Client for real-time communication
- Tailwind CSS for styling
- Framer Motion for animations

**Backend:**
- FastAPI for REST API
- Python Socket.IO for WebSocket communication
- Docker for secure code execution
- Uvicorn ASGI server

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Docker** (for code execution)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd Techathon3.0
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python app/main.py
```

The backend will start on `http://localhost:3000` (or port specified in `PORT` environment variable).

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173` (default Vite port).

#### 4. Configure Backend URL

If your backend is running on a different host/port, update the URL in:

**File:** `frontend/src/services/socketService.js`

```javascript
const BACKEND_URL = 'http://localhost:3000';  // Change this to your backend URL
```

For network access (e.g., WiFi hotspot):
```javascript
const BACKEND_URL = 'http://192.168.x.x:3000';  // Your machine's IP address
```

---

## 🐳 Docker Deployment (Alternative)

### Using Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The backend will be available at `http://localhost:8000`.

---

## 📱 Usage Guide

### For Teachers (Hosts)

1. **Create a Session**
   - Enter your name
   - Click "Create New Meeting"
   - Share the generated session code with students

2. **Monitor Students**
   - Click the student panel icon to see all connected students
   - Click on any student to view their code in real-time
   - See their output and errors

3. **Share Your Code**
   - Write code in your editor
   - Students will see your code in their "Shared Window"
   - Run code to broadcast output to all students

4. **Take Control**
   - Select a student from the panel
   - Click "Edit" to take control of their editor
   - Make changes that sync to the student in real-time
   - Click "Release" to return control

5. **Promote Student**
   - Click "Share" on a student to broadcast their code to all participants

### For Students (Participants)

1. **Join a Session**
   - Enter your name
   - Paste the session code from your teacher
   - Click "Join Now"

2. **Write Code**
   - Use the main editor to write your code
   - Your code is automatically synced to the teacher

3. **View Teacher's Code**
   - See teacher's code in the "Shared Window" panel
   - Watch live demonstrations

4. **Run Your Code**
   - Click the Run button (▶) or press `Ctrl+Enter`
   - View output in the terminal panel
   - Use the input field for interactive programs

5. **Session Timer**
   - Monitor remaining session time in the header
   - Sessions last 1 hour by default

---

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Run code |
| `Ctrl + S` | Save (placeholder) |
| `Ctrl + B` | Toggle student panel (teacher only) |

---

## 🔧 Configuration

### Backend Configuration

**Environment Variables:**

```bash
PORT=3000                    # Server port (default: 3000)
LOG_LEVEL=info              # Logging level
```

**Code Execution Settings:**

Edit `backend/app/execution/execution.py`:

```python
DEFAULT_TIMEOUT = 30        # Code execution timeout (seconds)
DEFAULT_MEMORY = "128m"     # Memory limit for containers
```

### Frontend Configuration

**Socket.IO Settings:**

Edit `frontend/src/services/socketService.js`:

```javascript
const BACKEND_URL = 'http://localhost:3000';

// Connection options
transports: ['websocket', 'polling'],
reconnection: true,
reconnectionDelay: 1000,
reconnectionAttempts: 5,
```

**Session Duration:**

Edit `frontend/src/store/sessionStore.js`:

```javascript
const SESSION_DURATION = 60 * 60;  // 1 hour in seconds
```

---

## 🧪 Testing

### Test Socket.IO Connection

Open `test_socket_connection.html` in a browser to test the WebSocket connection independently:

1. Enter your backend URL
2. Click "Connect"
3. Join as teacher or student
4. Monitor connection logs

### Manual Testing

1. Open two browser windows/tabs
2. Create a session in one (teacher)
3. Join the session in the other (student)
4. Verify:
   - Student appears in teacher's panel
   - Code changes sync in real-time
   - Code execution works
   - Teacher can view student code

---

## 📂 Project Structure

```
Techathon3.0/
├── backend/
│   ├── app/
│   │   ├── execution/
│   │   │   └── execution.py          # Code execution engine
│   │   ├── handlers/
│   │   │   ├── join_room.py          # Room join logic
│   │   │   ├── code_change.py        # Code sync handler
│   │   │   ├── disconnect.py         # Disconnect handler
│   │   │   ├── open_student.py       # Student view handler
│   │   │   └── promote_student.py    # Student promotion
│   │   ├── main.py                   # FastAPI + Socket.IO server
│   │   └── __init__.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Reusable components
│   │   │   ├── editor/               # Code editor components
│   │   │   ├── teacher/              # Teacher dashboard
│   │   │   ├── student/              # Student dashboard
│   │   │   └── terminal/             # Output panel
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── services/                 # Socket.IO service
│   │   ├── store/                    # Zustand state stores
│   │   ├── styles/                   # Global styles
│   │   ├── utils/                    # Utility functions
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker-compose.yml
├── test_socket_connection.html       # Connection test tool
├── FIXES_APPLIED.md                  # Recent bug fixes
└── README.md                         # This file
```

---

## 🐛 Troubleshooting

### Students Not Appearing in Teacher View

**Symptoms:** Teacher creates session, student joins, but doesn't appear in student list.

**Solutions:**
1. Check backend URL has `http://` protocol
2. Verify both devices are on the same network
3. Check browser console for WebSocket errors
4. Restart backend server
5. Clear browser cache and hard refresh (`Ctrl+Shift+R`)

See `FIXES_APPLIED.md` for detailed debugging steps.

### Code Execution Fails

**Symptoms:** Code doesn't run or shows timeout errors.

**Solutions:**
1. Ensure Docker is running
2. Check Docker socket permissions: `/var/run/docker.sock`
3. Verify Python image is available: `docker pull python:3.9-slim`
4. Check backend logs for execution errors

### Connection Issues

**Symptoms:** "Disconnected" status or frequent reconnections.

**Solutions:**
1. Check firewall settings (allow port 3000/8000)
2. Verify backend is accessible: `curl http://localhost:3000/health`
3. Check network stability
4. Try using polling transport instead of WebSocket

### Session Expired

**Symptoms:** Session ends before 1 hour.

**Solutions:**
1. Check timer sync in browser console
2. Verify teacher's timer is running
3. Ensure backend is not restarting

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Monaco Editor** - VS Code's editor component
- **Socket.IO** - Real-time bidirectional communication
- **FastAPI** - Modern Python web framework
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework

---

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check `FIXES_APPLIED.md` for recent bug fixes
- Use `test_socket_connection.html` for connection debugging

---

<div align="center">

**Built with ❤️ for educators and learners**

© 2026 ORCA Labs. All rights reserved.

</div>
