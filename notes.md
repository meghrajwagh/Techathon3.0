# ORCA — Full Project Notes

> **What is this?** A complete, plain-English walkthrough of every part of the ORCA codebase — both the **Python backend** and the **React frontend**. If you need to continue this project, read this file and you'll know exactly what every file does, how data flows, and where to make changes.

---

## Table of Contents

1. [Big Picture — How ORCA Works](#1-big-picture--how-orca-works)
2. [Tech Stack](#2-tech-stack)
3. [Project Folder Structure](#3-project-folder-structure)
4. [Backend — Full Breakdown](#4-backend--full-breakdown)
5. [Frontend — Full Breakdown](#5-frontend--full-breakdown)
6. [Data Flow Diagrams](#6-data-flow-diagrams)
7. [How To Run](#7-how-to-run)
8. [Common Tasks — Where To Edit](#8-common-tasks--where-to-edit)
9. [Known Gotchas & Tips](#9-known-gotchas--tips)

---

## 1. Big Picture — How ORCA Works

ORCA is a **real-time collaborative coding platform** (like a classroom version of VS Code). Here's the simple version:

1. A **teacher** (called "host") creates a meeting — they get a unique room code.
2. **Students** join the meeting by entering that room code.
3. Everyone writes code in their own editor. The teacher can:
   - See every student's code **live** (as they type).
   - Open and read any student's code in a side panel.
   - **Take control** of a student's editor and type in it.
   - **Promote** a student's code to be shared with the class.
   - Run code and see output in a terminal.
4. Students can:
   - Write their own code.
   - See the **teacher's code** in a read-only panel on the left.
   - Run their own code.
5. There's a **countdown timer** that syncs between teacher and all students.
6. When the teacher leaves, the session ends for everyone.

**How do they talk to each other?** Through **WebSockets** (specifically Socket.IO). This is like an always-open phone line between the browser and the server — instead of the browser asking "any updates?" every second, the server can push updates instantly.

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend server** | Python + FastAPI | Simple API framework, handles HTTP routes |
| **Real-time communication** | python-socketio | WebSocket library for instant messaging between server and clients |
| **ASGI server** | Uvicorn | Runs the async Python server |
| **Code execution** | subprocess (Python/Node.js) | Runs student/teacher code in a child process |
| **Frontend framework** | React (Vite) | Fast, component-based UI |
| **State management** | Zustand | Lightweight alternative to Redux — stores shared data across components |
| **Code editor** | Monaco Editor (@monaco-editor/react) | Same editor that powers VS Code |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Animations** | Framer Motion | Smooth animations for React components |
| **Icons** | Lucide React | Clean, modern icon set |

---

## 3. Project Folder Structure

```
Techathon3.0/
├── backend/
│   ├── app/
│   │   ├── main.py                    # ⭐ THE main server file — all socket events
│   │   ├── handlers/                  # Extracted handler functions
│   │   │   ├── join_room.py           # What happens when someone joins
│   │   │   ├── disconnect.py          # What happens when someone disconnects
│   │   │   ├── code_change.py         # When a student types code
│   │   │   ├── open_student.py        # When teacher clicks a student to view
│   │   │   └── promote_student.py     # When teacher shares a student's code
│   │   └── execution/
│   │       └── execution.py           # ⭐ Code runner — runs Python/JS code
│   ├── requirements.txt               # Python dependencies
│   └── Dockerfile                     # Docker config (optional)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # ⭐ Root component — landing page + routing
│   │   ├── main.jsx                   # Entry point — mounts React
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Header.jsx         # Top bar (timer, brand, leave button)
│   │   │   ├── editor/
│   │   │   │   ├── EditorHeader.jsx   # Tabs, run button, language picker
│   │   │   │   └── CodeEditor.jsx     # Monaco editor wrapper
│   │   │   ├── terminal/
│   │   │   │   └── OutputPanel.jsx    # Terminal output panel
│   │   │   ├── teacher/
│   │   │   │   ├── TeacherDashboard.jsx  # ⭐ Main teacher screen
│   │   │   │   ├── StudentPanel.jsx      # Slide-out student list
│   │   │   │   ├── StudentCard.jsx       # Individual student card in the list
│   │   │   │   ├── StudentCodeViewer.jsx # Full-screen student code viewer
│   │   │   │   └── StudentPreviewModal.jsx # Quick-peek modal
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx  # ⭐ Main student screen
│   │   │   │   └── SharedWindow.jsx      # Read-only teacher code panel
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx, Button.jsx, Avatar.jsx, Panel.jsx
│   │   │   │   ├── ErrorBoundary.jsx     # Catches React crashes
│   │   │   │   └── SessionTimer.jsx      # (Legacy — timer now inlined in Header)
│   │   │   └── Waves.jsx                 # Animated wave background on landing page
│   │   ├── store/                     # ⭐ Zustand stores (shared state)
│   │   │   ├── sessionStore.js        # Session data, timer, create/join/end logic
│   │   │   ├── editorStore.js         # Editor state (code, language, font size)
│   │   │   ├── studentStore.js        # Student-specific state (shared code from teacher)
│   │   │   ├── teacherStore.js        # Teacher-specific state (student list, control)
│   │   │   └── socketStore.js         # Connection status (connected/disconnected)
│   │   ├── hooks/                     # ⭐ React hooks (logic reuse)
│   │   │   ├── useSocketConnection.js # Connect/disconnect, timer sync, room close
│   │   │   ├── useTeacherSocket.js    # Teacher-specific socket listeners
│   │   │   ├── useStudentSocket.js    # Student-specific socket listeners
│   │   │   ├── useCodeExecution.js    # Run code, collect output, stop execution
│   │   │   └── useKeyboardShortcuts.js# Ctrl+Enter to run, etc.
│   │   ├── services/
│   │   │   ├── socketService.js       # ⭐ Socket.IO client singleton
│   │   │   └── codeExecutor.js        # Sends code to backend and streams output
│   │   ├── utils/
│   │   │   ├── mockData.js            # Code templates, supported languages
│   │   │   ├── cn.js                  # Tailwind class merge utility
│   │   │   └── debounce.js            # Debounce utility
│   │   └── styles/
│   │       ├── globals.css            # Base resets, scrollbar, glass effects
│   │       ├── editor-theme.css       # Monaco editor color customizations
│   │       └── animations.css         # Keyframe animations
│   ├── tailwind.config.js             # Tailwind custom colors, fonts, animations
│   ├── vite.config.js                 # Vite dev server config (port, aliases)
│   └── package.json                   # Dependencies
│
├── docker-compose.yml                 # Docker setup for backend
└── README.md                          # Project readme
```

---

## 4. Backend — Full Breakdown

### 4.1. `main.py` — The Brain

This is the **central file** of the entire backend. It does three things:

1. **Creates the server** (FastAPI + Socket.IO)
2. **Defines all real-time event handlers** (what happens when a message comes in)
3. **Provides HTTP health-check routes** (`/` and `/health`)

#### How the server is set up

```python
app = FastAPI()                           # Normal HTTP server
sio = socketio.AsyncServer(...)           # WebSocket server
socket_app = socketio.ASGIApp(sio, app)   # Combine both into one app
```

When you run `uvicorn app.main:socket_app`, it starts **both** the HTTP and WebSocket servers on the same port.

#### The `rooms` dictionary — The entire state

Everything about every active session is stored in a single Python dictionary called `rooms`:

```python
rooms = {
    "abc-123": {                          # Room ID (session code)
        "teacher": "socket_id_xyz",       # The teacher's socket connection ID
        "students": {                     # Dictionary of all students
            "socket_id_001": {
                "name": "Alice",
                "code": "print('hello')",
                "output": "hello",
                "error": None
            },
            "socket_id_002": { ... }
        },
        "mainView": {                     # Which code is shown on the "main screen"
            "type": "student",            # Could be "teacher" or "student"
            "studentId": "socket_id_001"  # Which student is promoted
        },
        "timer_remaining": 3600,          # Seconds left on the clock
        "timer_updated_at": 1708646400.0  # When the timer was last synced
    }
}
```

> **Important:** This is **in-memory only** — if the server restarts, all rooms are lost. There's no database.

#### All Socket Events (what messages the server handles)

| Event Name | Who sends it | What it does |
|-----------|-------------|-------------|
| `connect` | Browser (auto) | Logs that someone connected |
| `disconnect` | Browser (auto) | If teacher: end room, kick students. If student: save their code for rejoin, remove from room |
| `join_room` | Browser | Create room (first person = teacher) or join existing room (= student). Sends back `role_assigned` |
| `validate_room` | Browser | Check if a room code exists before joining. Returns `{valid: true/false}` |
| `leave_room` | Browser | Explicit leave. Teacher leaving = room deleted. Student leaving = removed from list |
| `code_change` | Student | Student typed something. Updates stored code, forwards to teacher |
| `run_code` | Anyone | Execute code on the server. Streams output back via `code_output` events |
| `code_input` | Anyone | Send keyboard input to a running program (for `input()` prompts) |
| `stop_code` | Anyone | Kill a running program |
| `teacher_code_change` | Teacher | Teacher typed something. Broadcast to all students |
| `teacher_output` | Teacher | Teacher ran code. Broadcast output to all students |
| `teacher_take_control` | Teacher | Lock a student's editor so teacher can type in it |
| `teacher_release_control` | Teacher | Unlock the student's editor |
| `teacher_edit_student_code` | Teacher | Send edited code to a specific student |
| `open_student` | Teacher | Retrieve a student's code/output (callback-based) |
| `promote_student` | Teacher | Set a student's code as the "main view" for the class |
| `sync_timer` | Teacher | Broadcast current timer value to all students |

---

### 4.2. `handlers/` — Extracted Event Logic

These are just **helper functions** called by the events in `main.py`. They were extracted for cleaner code.

#### `join_room.py`

- If the room doesn't exist → create it, make the joiner the **teacher**
- If the room exists → add the joiner as a **student**
- After a student joins → tell the teacher "your student list changed" (`student_list_update`)

#### `disconnect.py`

- **Teacher disconnects** → emit `room_closed` to all students, kick everyone, delete the room
- **Student disconnects** → remove from the room, tell the teacher the student list changed
- If the student was being shown on the "main view", reset it back to teacher

#### `code_change.py`

- Student sends `{roomId, code}` → server saves the code in `rooms[roomId].students[sid].code` → forwards `{studentId, code}` to the teacher

#### `open_student.py`

- Teacher asks to see a specific student → server returns `{name, code, output}` for that student
- Uses a **callback** (the teacher gets the response directly, like an API call)

#### `promote_student.py`

- Teacher promotes a student → the room's `mainView` is updated → all clients in the room get `main_view_update`

---

### 4.3. `execution/execution.py` — The Code Runner

This file is responsible for **actually running Python and JavaScript code**. It has two modes:

#### Interactive mode (primary) — `start_interactive()`

This is the main mode used by the app:

1. Writes the code to a **temporary file** (e.g., `/tmp/abc123.py`)
2. Starts a **subprocess** (`python -u` for Python, `node` for JavaScript)
3. Reads stdout and stderr in **real-time** using background threads
4. Sends each line of output back to the client instantly via `code_output` events
5. When the process finishes, sends `code_done` with full output + exit code
6. Has a **timeout** (default 30 seconds) — kills the process if it runs too long
7. Cleans up the temp file when done

The tricky part is `_has_pending_data()` — on Windows, it uses the Windows API (`PeekNamedPipe`) to check if there's data in the pipe without blocking. This is needed so that `input()` prompts (which don't end with `\n`) get delivered immediately.

#### Non-interactive mode (legacy) — `run_code()`

A simpler version that runs the code, waits for it to finish, and returns all output at once. Also supports Docker execution (runs code inside a `python:3.11-slim` container for sandboxing) if Docker is available.

#### Key functions

| Function | What it does |
|----------|-------------|
| `start_interactive(code, sid, timeout, language, on_output, on_done)` | Run code as a subprocess, stream output |
| `send_input(session_id, text)` | Write text to the subprocess's stdin (for interactive programs) |
| `stop_process(session_id)` | Kill a running process |
| `_cleanup(session_id)` | Delete temp file, remove from running processes |
| `run_code(code, timeout, language)` | Non-interactive one-shot execution |

---

## 5. Frontend — Full Breakdown

### 5.1. `App.jsx` — The Entry Point

This is the **root component** that decides what to show:

- **No active session?** → Show the **landing page** (glassmorphism card with Create/Join forms)
- **Active session + role is "host"?** → Show `TeacherDashboard`
- **Active session + role is "participant"?** → Show `StudentDashboard`

The landing page has:
- A form with name input + "Create New Meeting" button
- A join section with room code input + "Join Now" button
- An earth image on the right side with animated background waves (`Waves.jsx`)
- Glassmorphism effect (frosted glass look) on the main card

When creating a session: calls `sessionStore.createSession(name)` which generates a random room code, connects to Socket.IO, and emits `join_room`.

When joining: first validates the room exists via `validate_room` event, then calls `sessionStore.joinSession(code, name)`.

---

### 5.2. Stores — The Shared State

Think of stores as **global variables** that any component can read and write. We use **Zustand** (a lightweight state library).

#### `sessionStore.js` — Session & Timer Logic

This is the **most important store**. It manages:

| State | What it is |
|-------|-----------|
| `sessionId` | The room code (e.g., "abc-123") |
| `role` | "host" or "participant" |
| `isActive` | Whether a session is currently running |
| `timeRemaining` | Seconds left on the session timer |
| `userName` | The user's display name |

**Key actions:**

- `createSession(name)` — Generates a random session ID, connects to Socket.IO, joins the room, starts the timer
- `joinSession(sessionId, name)` — Connects to Socket.IO, joins an existing room, starts the timer
- `endSession()` — Clears all state, disconnects socket, emits `leave_room`
- `receiveTimerSync(seconds)` — Students use this to sync their timer to the teacher's
- `_startTimer()` — Starts a 1-second countdown interval. If you're the host, also broadcasts timer to students every 10 seconds via `sync_timer`

> **How timer sync works:** The teacher's timer is the "source of truth." Every 10 seconds, the teacher sends the current `timeRemaining` to the server, which broadcasts it to all students. Students override their local timer with whatever the teacher says.

#### `editorStore.js` — Editor State

Manages the code editor UI:

| State | What it is |
|-------|-----------|
| `code` | The current code in the editor |
| `language` | "javascript" or "python" |
| `fontSize` | Editor font size (default 14) |
| `theme` | "vs-dark" (dark mode) |
| `showMinimap` | Whether the minimap is visible |
| `tabs` | File tabs (currently just one: "main.js") |

When you change language, it loads a default template from `mockData.js` and updates the tab name.

#### `studentStore.js` — Student-Specific State

Only used by students:

| State | What it is |
|-------|-----------|
| `code` | The student's own code |
| `sharedCode` | The teacher's code (shown in the left panel) |
| `sharedOutput` | The teacher's terminal output |
| `sharedLabel` | Label like "Host's Code" |
| `isSharedMinimized` | Whether the teacher panel is collapsed |
| `isControlledByTeacher` | Whether the teacher has locked the student's editor |

#### `teacherStore.js` — Teacher-Specific State

Only used by the teacher:

| State | What it is |
|-------|-----------|
| `students` | Array of all connected students (with their code, output, name) |
| `isPanelOpen` | Whether the student list panel is open |
| `selectedStudent` | The student currently being viewed in the split panel |
| `promotedStudentId` | Which student's code is being shared with the class |
| `controlledStudentId` | Which student's editor the teacher is currently typing in |

**Key actions:**
- `takeControl(studentId)` — Locks the student's editor and emits `teacher_take_control`
- `releaseControl()` — Unlocks the student's editor
- `promoteStudent(studentId)` — Toggles sharing a student's code (emits `promote_student`)

#### `socketStore.js` — Connection Status

Simple store that just tracks whether the WebSocket is connected:

| State | What it is |
|-------|-----------|
| `isConnected` | true/false — used to show "Live" / "Offline" in the header |
| `reconnectAttempts` | How many times we've tried to reconnect |

---

### 5.3. Services — Backend Communication

#### `socketService.js` — The Socket.IO Client

This is a **singleton class** (only one instance exists). It manages the WebSocket connection:

```
BACKEND_URL = 'http://192.168.137.1:8000'
```

**Key methods:**

| Method | What it does |
|--------|-------------|
| `connect(roomId, userName)` | Establish WebSocket connection, then emit `join_room` |
| `disconnect()` | Close the connection |
| `emit(event, data)` | Send a message to the server |
| `on(event, callback)` | Listen for a message from the server |
| `off(event, callback)` | Stop listening |
| `isConnected()` | Check if connected |

Important detail: after connecting, it automatically adds listeners for `connect`, `disconnect`, `connect_error`, and `reconnect` on the raw socket to update `socketStore`.

#### `codeExecutor.js` — Code Execution Client

Wraps the socket service for running code:

| Function | What it does |
|----------|-------------|
| `executeCodeInteractive(code, language, {onOutput, onDone})` | Emits `run_code`, listens for `code_output` (streaming) and `code_done` (final result). Returns a cleanup function |
| `sendCodeInput(text)` | Emits `code_input` for interactive programs |
| `stopCodeExecution()` | Emits `stop_code` to kill the process |

---

### 5.4. Hooks — Reusable Logic

#### `useSocketConnection.js` — The Main Connection Hook

Used by `App.jsx`. Does two things:

1. **Auto-connects** when there's a session ID and it's not already connected
2. **Listens for global events:**
   - `role_assigned` → sets the role in sessionStore
   - `timer_sync` → syncs student timer to teacher
   - `room_closed` → alerts the user and ends the session (when teacher leaves)
   - `restore_code` → restores code if a student rejoins after disconnecting

#### `useTeacherSocket.js` — Teacher-Only Listeners

Listens for events that only matter to the teacher:

| Event | What it does |
|-------|-------------|
| `student_list_update` | Updates the student list in teacherStore |
| `code_update` | A student's code changed — update their entry |
| `student_output` | A student ran their code — save the output |

#### `useStudentSocket.js` — Student-Only Listeners

Listens for events that only matter to students:

| Event | What it does |
|-------|-------------|
| `teacher_code_change` | Teacher typed something — update sharedCode |
| `teacher_output` | Teacher ran code — update sharedOutput |
| `teacher_take_control` | Teacher locked the editor — set isControlledByTeacher = true |
| `teacher_release_control` | Teacher unlocked the editor |
| `teacher_edit_code` | Teacher is typing in the student's editor — update code |
| `shared_code` | Shared/promoted code from another student |

Also **emits** `code_change` whenever the student types (debounced).

#### `useCodeExecution.js` — Run Code Hook

Wraps `codeExecutor.js` with React state:

- `runCode(code, language)` — starts execution, resets output
- `output` / `error` / `isRunning` — reactive state for the terminal
- `sendInput(text)` — for interactive stdin
- `stopExecution()` — kills the process
- `clearOutput()` — clears the terminal

#### `useKeyboardShortcuts.js` — Keyboard Shortcuts

Listens for:
- **Ctrl+Enter** or **Cmd+Enter** → Run code
- **Ctrl+S** or **Cmd+S** → Save (prevents default browser save dialog)
- **Ctrl+\\** → Toggle student panel (teacher only)

---

### 5.5. Components — The UI

#### `Header.jsx` — Top Bar

The thin bar at the very top. Shows:
- **Timer** with a colored dot (green → amber → red as time runs out)
- **ORCA** brand name
- **Role badge** (Host or Student)
- **Students button** (teacher only — opens the student panel)
- **Session ID** with a copy button
- **Connection status** (Live / Offline)
- **Leave button**

#### `EditorHeader.jsx` — Editor Toolbar

The bar above the code editor. Contains:
- **File tabs** (shows the current file name like "main.js")
- **Run / Stop button** (green = run, red = stop)
- **Keyboard shortcut hint** (⌘ Enter)
- **Language selector** dropdown (JavaScript / Python)
- **Font size controls** (+/- buttons)
- **Language badge** (shows current language)

#### `CodeEditor.jsx` — Monaco Editor

A wrapper around the Monaco code editor (the same editor VS Code uses). It:
- Accepts `value`, `onChange`, `language`, `fontSize`, `readOnly` props
- Applies a custom dark theme
- Handles editor mounting and configuration

#### `OutputPanel.jsx` — Terminal

The terminal panel below the editor. Shows:
- Code execution output (white text)
- Errors (red text)
- A "running" indicator with animated dots
- An **input bar** when a program is waiting for input (like Python's `input()`)
- Clear and Stop buttons

#### `TeacherDashboard.jsx` — Teacher's Main Screen

The full teacher experience. Layout:

```
┌─────────────────────────────────────┐
│ Header (timer, brand, leave)        │
├─────────────────────────────────────┤
│ EditorHeader (tabs, run, language)  │
├──────────────────┬──────────────────┤
│                  │                  │
│  Teacher's Code  │ Selected Student │
│  (Monaco Editor) │  (Monaco Editor) │
│                  │                  │
├── drag handle ───┼── drag handle ───┤
│  Teacher Output  │ Student Output   │
│  (Terminal)      │ (Terminal)       │
└──────────────────┴──────────────────┘
```

- Left side: teacher's own code editor and terminal
- Right side: appears when teacher clicks on a student — shows that student's code
- Middle vertical divider is **draggable** to resize left/right
- Terminal panels are **draggable** to resize up/down
- When a student is selected, teacher can **Edit** (take control), **Share** (promote), or **close** the panel

#### `StudentDashboard.jsx` — Student's Main Screen

The full student experience. Layout:

```
┌─────────────────────────────────────┐
│ Header (timer, brand, leave)        │
├──────────────────┬──────────────────┤
│                  │ EditorHeader     │
│  Teacher's Code  ├──────────────────┤
│  (SharedWindow)  │ Student's Code   │
│  (read-only)     │ (Monaco Editor)  │
│                  │                  │
├── drag handle ───┼── drag handle ───┤
│  Teacher Output  │ Student Output   │
│  (Terminal)      │ (Terminal)       │
└──────────────────┴──────────────────┘
```

- Left side: read-only view of the teacher's code (`SharedWindow`)
- Right side: the student's own editor and terminal
- If teacher takes control, a yellow banner appears: "Teacher is editing — your editor is locked"
- SharedWindow can be collapsed to a thin strip to maximize editor space

#### `SharedWindow.jsx` — Teacher Code View (Student Side)

The left panel in the student dashboard:
- Shows teacher's code in a read-only Monaco editor
- Shows teacher's terminal output below
- Can be minimized to a thin vertical strip (just shows "Host View" rotated text)
- Has a resizable drag handle between editor and terminal

#### `StudentPanel.jsx` — Slide-Out Student List (Teacher Side)

A side panel that slides in from the right. Shows **all connected students** as cards:
- Student name and online status
- Code preview snippet
- Output preview
- Buttons to view/edit the student's code

#### `StudentCard.jsx` — Individual Student Card

Each card in the student panel shows:
- Avatar with the student's initial
- Name and online indicator
- Code preview (first few lines)
- Output preview
- "View" and "Edit" buttons

#### `Waves.jsx` — Animated Background

The wavy line animation on the landing page. Pure SVG + CSS animations. Creates a subtle, flowing background effect.

#### Common Components

- **`Button.jsx`** — Reusable button with variants (primary, secondary, ghost, danger, success) and sizes
- **`Badge.jsx`** — Small colored labels (blue, green, red, etc.)
- **`Avatar.jsx`** — Circle with initials and gradient background
- **`Panel.jsx`** — Slide-out panel container
- **`ErrorBoundary.jsx`** — Catches React errors so the whole app doesn't crash
- **`SessionTimer.jsx`** — Legacy timer component (timer is now built into Header)

---

## 6. Data Flow Diagrams

### Creating a Session (Teacher)

```
User clicks "Create New Meeting"
    │
    ▼
sessionStore.createSession(name)
    │ → generates random room ID
    │ → calls socketService.connect(roomId, userName)
    │
    ▼
socketService creates Socket.IO connection
    │ → emits 'join_room' {roomId, userName}
    │
    ▼
Backend main.py receives 'join_room'
    │ → room doesn't exist → creates room, sets this socket as teacher
    │ → emits 'role_assigned' {role: 'teacher'} back to this client
    │
    ▼
useSocketConnection hook receives 'role_assigned'
    │ → sessionStore.setRole('host')
    │ → now `isActive && role` → App.jsx shows TeacherDashboard
```

### Student Joins

```
User enters room code, clicks "Join Now"
    │
    ▼
sessionStore.joinSession(code, name)
    │ → calls socketService.connect(roomId, userName)
    │
    ▼
Backend receives 'join_room'
    │ → room exists → adds student to students dict
    │ → emits 'role_assigned' {role: 'student'} to this client
    │ → emits 'student_list_update' {students: {...}} to teacher
    │ → emits 'timer_sync' to this client (so timer matches)
    │
    ▼
Teacher's useTeacherSocket receives 'student_list_update'
    │ → updates teacherStore.students[]
    │
TeacherDashboard detects students.length changed
    │ → emits 'teacher_code_change' {code: currentCode}
    │
    ▼
Backend relays 'teacher_code_change' to all students
    │
    ▼
Student's useStudentSocket receives 'teacher_code_change'
    │ → updates studentStore.sharedCode
    │ → SharedWindow shows teacher's code
```

### Student Types Code

```
Student types in Monaco editor
    │
    ▼
StudentDashboard.handleCodeChange(newCode)
    │ → studentStore.setCode(newCode)
    │ → useStudentSocket.sendCodeChange(newCode)
    │     → emits 'code_change' {roomId, code}
    │
    ▼
Backend receives 'code_change'
    │ → saves code in rooms[roomId].students[sid].code
    │ → emits 'code_update' {studentId, code} to teacher
    │
    ▼
Teacher's useTeacherSocket receives 'code_update'
    │ → teacherStore.updateStudentCode(studentId, code)
    │ → if teacher is viewing that student, the editor updates live
```

### Running Code

```
User clicks Run (or Ctrl+Enter)
    │
    ▼
useCodeExecution.runCode(code, language)
    │ → calls codeExecutor.executeCodeInteractive()
    │     → emits 'run_code' {code, language, timeout}
    │     → listens for 'code_output' and 'code_done'
    │
    ▼
Backend receives 'run_code'
    │ → writes code to temp file
    │ → spawns subprocess (python -u or node)
    │ → reads stdout/stderr in background threads
    │ → for each chunk of output:
    │     → emits 'code_output' {text, isError} to the user
    │ → when process finishes:
    │     → emits 'code_done' {output, error, exit_code} to the user
    │     → if user is a student:
    │         → emits 'student_output' {studentId, output, error} to teacher
    │
    ▼
Frontend receives 'code_output' events
    │ → appends text to output state
    │ → OutputPanel re-renders with new text (live streaming)
    │
Frontend receives 'code_done'
    │ → sets isRunning = false
    │ → if there was an error, sets error state
```

---

## 7. How To Run

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:socket_app --host 0.0.0.0 --port 3000 --reload
```

- `--host 0.0.0.0` makes it accessible on your local network (not just localhost)
- `--port 3000` is the port number
- `--reload` auto-restarts when you save a file

### Frontend

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server on `http://localhost:5173`.

### Important: Backend URL

The frontend connects to the backend via the URL in `frontend/src/services/socketService.js`:

```javascript
const BACKEND_URL = 'http://192.168.137.1:8000';
```

**Change this** to match wherever your backend is running (e.g., `http://localhost:3000` for local dev).

---

## 8. Common Tasks — Where To Edit

### "I want to add a new programming language (e.g., Java)"

1. **Backend** `execution/execution.py` — Add a new `elif` branch in `start_interactive()` for the file extension and command:
   ```python
   elif language == "java":
       suffix = ".java"
       cmd_prefix = ["javac", "-then-run"]  # you'd need a wrapper script
   ```
2. **Frontend** `utils/mockData.js` — Add to `SUPPORTED_LANGUAGES` and `CODE_TEMPLATES`
3. **Frontend** `store/editorStore.js` — Add the extension in `extensionMap`

### "I want to save rooms to a database"

Replace the in-memory `rooms = {}` dict in `main.py` with database calls (e.g., Redis, MongoDB). Every time you do `rooms[room_id] = ...`, replace it with a database write. Every time you do `rooms.get(room_id)`, replace with a database read.

### "I want to add a chat feature"

1. **Backend** `main.py` — Add a `chat_message` socket event that broadcasts to the room
2. **Frontend** — Create a new `ChatPanel.jsx` component and a `chatStore.js` store
3. **Frontend** `useSocketConnection.js` — Add listener for `chat_message`

### "I want to change the session timer duration"

- `frontend/src/store/sessionStore.js` — Look for `SESSION_DURATION` (it's in seconds, e.g., `3600` = 1 hour)

### "I want to change the landing page design"

- Edit `frontend/src/App.jsx` — the `SessionScreen` component

### "I want to change the editor theme/colors"

- `frontend/src/styles/editor-theme.css` — Monaco theme colors
- `frontend/tailwind.config.js` — App-wide color tokens
- `frontend/src/styles/globals.css` — Base styles, glass effects

### "I want to add a new socket event"

1. **Backend** `main.py` — Add a new `@sio.event` handler
2. **Frontend** — Emit the event via `socketService.emit('event_name', data)`
3. **Frontend** — Listen for it in the appropriate hook (`useSocketConnection`, `useTeacherSocket`, or `useStudentSocket`)

---

## 9. Known Gotchas & Tips

### State is all in-memory
If the backend crashes or restarts, **all rooms are lost**. Students will need to rejoin. However, there is a `disconnected_students` dict that saves student code temporarily if they disconnect and reconnect quickly.

### Timer sync is one-directional
The teacher's timer is the truth. Students always follow. If you need bi-directional sync or pausing, you'll need to add more events.

### Socket IDs change on reconnect
When a client disconnects and reconnects, they get a **new socket ID**. The rejoin logic uses `(roomId, userName)` as a key to restore their saved code.

### The `rooms` dict key is the room code, but student keys are socket IDs
Don't confuse them. Room code = `"abc-123"` (human-readable). Socket ID = `"sio_abc123xyz"` (internal).

### CORS is wide open
Both FastAPI and Socket.IO allow `*` origins. This is fine for development but should be locked down for production.

### No authentication
Anyone with a room code can join. There's no password, no login, no JWT. Add this if you deploy publicly.

### Docker support is optional
The code execution engine tries Docker first (sandboxed), but falls back to raw subprocess. For production, you **should** use Docker to prevent malicious code from harming your server.

### Tailwind classes vs inline styles
Some components use Tailwind utility classes, others use `style={{}}` for glassmorphism effects (because Tailwind can't express complex `rgba` + `backdrop-filter` combinations cleanly). Both approaches are valid.

### The `EditorToolbar.jsx` file still exists but is unused
The run button was merged into `EditorHeader.jsx`. The old `EditorToolbar.jsx` file is still in the codebase but nothing imports it. It can be safely deleted.

---

> **That's everything!** This document covers every file, every event, every store, and every component in the ORCA project. If you need to make changes, use the "Common Tasks" section to find where to edit, and the "Data Flow Diagrams" section to understand how data moves through the system.
