# AI Live Teacher — System Architecture 🏗️

This document details the modular monolith architecture of **AI Live Teacher**.

---

## 🏛️ System Overview

```
                   +---------------------------------------+
                   |            Student Browser            |
                   |                                       |
                   |  - VirtualClassroom UI (React)        |
                   |  - DigitalWhiteboard (Event Driven)   |
                   |  - TeacherAvatarView (Pluggable UI)   |
                   |  - CameraVisionControl (1 FPS stream) |
                   +-------------------+-------------------+
                                       |
                       WebSocket / HTTP REST API
                                       |
                   +-------------------v-------------------+
                   |         Express Server (server.ts)    |
                   |                                       |
                   |  - /ws/live WebSocket Bridge          |
                   |  - /api/textbook/upload (pdf-parse)   |
                   |  - /api/gemini/chat (REST Fallback)   |
                   +-------------------+-------------------+
                                       |
                  Google @google/genai SDK (Server-Side)
                                       |
                   +-------------------v-------------------+
                   |    Google Gemini Live API Session     |
                   | (gemini-3.1-flash-live-preview)       |
                   |                                       |
                   |  - PCM Audio Streaming (16kHz / 24kHz) |
                   |  - TeacherOrchestrator System Prompt   |
                   |  - Whiteboard Function Tool Calls     |
                   +---------------------------------------+
```

---

## 🧩 Core Modules

### 1. `GeminiLiveClient` (`src/lib/GeminiLiveClient.ts`)
- Manages client-side WebSocket communication.
- Captures microphone audio using `AudioContext` and `ScriptProcessorNode`, converting float32 samples to 16kHz PCM16 base64.
- Receives 24kHz PCM audio chunks from Gemini Live and plays them back gaplessly using `AudioBufferSourceNode` scheduling.
- Handles natural barge-in / interruption signals from model turns.

### 2. `TeacherOrchestrator` (`src/lib/TeacherOrchestrator.ts`)
- Formulates the system instruction enforcing the **Teach → Ask → Listen → Evaluate → Adapt** loop.
- Injects learner profile (Name: Aarav/Ananya, Age: 7, Class: 2, Subject: Math, Language: English/Hindi/Hinglish).
- Injects textbook excerpt if active.
- Declares function calls (`show_objects`, `draw_number_line`, `show_equation`, `show_text`, `show_image`, `show_multiple_choice`, `start_quiz`, `check_answer`, `clear_board`).

### 3. `LessonState` (`src/lib/LessonState.ts`)
- Holds structured `ClassroomState` (Student info, subject, chapter, concept, objective, understanding estimate 0–100%, diagnosed misconceptions, mastered concepts, active strategy).

### 4. `AvatarAdapter` (`src/lib/AvatarAdapter.ts` & `src/lib/PlaceholderTeacherAdapter.ts`)
- Decoupled interface with methods:
  - `speak(audioData, text)`
  - `interrupt()`
  - `setEmotion(emotion)`
  - `setGesture(gesture)`
  - `lookAtBoard()`
  - `lookAtStudent()`
- `PlaceholderTeacherAdapter` renders Ms. Priya behind her classroom desk with lip-sync audio wave animations and emotion badges.

### 5. `DigitalWhiteboard` (`src/components/DigitalWhiteboard.tsx`)
- Event-driven whiteboard component rendering animated object grids, number line pointers, math equations, and multiple-choice questions.

### 6. `TextbookService` (`/api/textbook/upload`)
- Ingests uploaded PDF/JPG/PNG textbook files using `pdf-parse` and Gemini text analysis to extract chapter title, summary, and key concepts.
