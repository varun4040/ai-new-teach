# AI Live Teacher 👩‍🏫⭐

**AI Live Teacher** is a proof-of-concept interactive virtual classroom designed for young school children (Ages 6–10, Grade 2 default). It combines real-time conversational AI, interactive digital whiteboard tool execution, live camera/vision support, textbook ingestion, and modular teacher orchestration.

---

## 🌟 Primary Capabilities

1. **Realtime Multimodal AI Intelligence**:
   - Uses **Google Gemini Live API** (`gemini-3.1-flash-live-preview`) for low-latency audio-to-audio interaction, natural barge-in/interruption, and real-time vision frame processing.
   - Handles text chat, voice streaming, and camera frames simultaneously.

2. **Teacher Orchestrator (Pedagogy Loop)**:
   - Enforces **Teach → Ask → Listen → Evaluate → Adapt → Teach Again**.
   - **Never becomes a dry answer machine**: When a child asks "Why is 8 bigger than 5?", the teacher automatically triggers a whiteboard visual tool showing 8 red apples and 5 green apples.
   - Multilingual support: English, Hindi, Hinglish with auto-switching.

3. **Event-Driven Digital Whiteboard Tool System**:
   - `show_objects`: Countable 3D/vector items (apples 🍎, stars ⭐, cookies 🍪, balloons 🎈, pencils ✏️, blocks 🧱, balls ⚽) grouped visually for addition.
   - `draw_number_line`: Interactive line with animated pointer.
   - `show_equation`: Step-by-step math breakdowns.
   - `show_text`: Story and concept cards.
   - `show_image`: Educational diagrams (Fractions, Shapes, Clock, Solar System, Plant, Coins).
   - `show_multiple_choice` & `check_answer`: Clickable practice options with instant feedback.

4. **Pluggable Avatar Adapter Architecture**:
   - Decoupled `AvatarAdapter` interface (`speak`, `interrupt`, `setEmotion`, `setGesture`, `lookAtBoard`, `lookAtStudent`).
   - Implements `PlaceholderTeacherAdapter` (Ms. Priya with lip-sync, emotion badges, teacher desk scene, and speech bubbles).
   - Allows seamless drop-in replacement with photorealistic avatar providers (HeyGen, D-ID) in the future without modifying the Teacher Brain.

5. **Camera & Vision**:
   - Camera disabled by default with privacy badges.
   - Captures and sends video frames at 1 FPS over WebSocket to Gemini Live to inspect student notebook work.

6. **Textbook Mode**:
   - Upload PDF, PNG, JPG chapter files.
   - Serves as the **primary source of truth** so the teacher never rewrites character names, story sequence, or textbook facts.

---

## ⚙️ Prerequisites & Google API Setup

1. **Google Gemini API Key**:
   - Obtain a key from [Google AI Studio](https://aistudio.google.com/).
   - Set `GEMINI_API_KEY` in your `.env` file or environment variables.
   - *Note*: If `GEMINI_API_KEY` is not provided, the app automatically runs in **Dev Classroom Fallback Mode** so you can run, test, and demonstrate the entire UI, whiteboard, and teacher orchestration locally.

2. **Browser Requirements**:
   - Modern Chromium browser (Google Chrome, Microsoft Edge) or Firefox with microphone and camera permissions enabled.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the project root:
```env
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 How to Plug in Realtime Photorealistic Avatars (HeyGen / D-ID)

The teacher visual layer is strictly separated from the Teacher Brain via the `AvatarAdapter` interface (`src/lib/AvatarAdapter.ts`).

To swap `PlaceholderTeacherAdapter` with HeyGen or D-ID:

1. Create a new class implementing `AvatarAdapter` (e.g. `src/lib/HeyGenAvatarAdapter.ts`):
   ```ts
   import { AvatarAdapter } from './AvatarAdapter';

   export class HeyGenAvatarAdapter implements AvatarAdapter {
     // Implement speak(), interrupt(), setEmotion(), setGesture(), lookAtBoard(), lookAtStudent()
     // using HeyGen WebRTC Live Streaming SDK
   }
   ```
2. In `src/App.tsx`, instantiate `HeyGenAvatarAdapter` instead of `PlaceholderTeacherAdapter`:
   ```ts
   const adapter = new HeyGenAvatarAdapter();
   ```
3. The Teacher Orchestrator, Gemini Live API stream, Whiteboard Tool System, and Classroom State will continue operating identically without any changes required!

---

## ⚠️ Known Limitations
- The current prototype relies on `PlaceholderTeacherAdapter` for zero-cost immediate verification.
- Mobile WebRTC audio contexts may require an initial user click gesture to unblock audio playback on iOS Safari.
