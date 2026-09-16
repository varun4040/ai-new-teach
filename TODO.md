# AI Live Teacher — Project Roadmap & TODO 📝

## ✅ Completed Proof-of-Concept Milestones (Phase 1)
- [x] Full-stack Express + Vite architecture (`server.ts`).
- [x] Integration with Google Gemini Live API (`gemini-3.1-flash-live-preview`).
- [x] WebSocket server stream for bidirectional 16kHz microphone audio, 24kHz speaker playback, video frames, and function calling.
- [x] Pluggable `AvatarAdapter` interface and `PlaceholderTeacherAdapter` implementation.
- [x] Interactive event-driven Digital Whiteboard with 10 callable tool functions (`show_objects`, `draw_number_line`, `show_equation`, `show_text`, `show_image`, `show_multiple_choice`, `start_quiz`, `check_answer`, `clear_board`).
- [x] Teacher Orchestrator enforcing the pedagogical loop (Teach → Ask → Listen → Evaluate → Adapt).
- [x] Camera/Vision controller sending sampled frames (1 FPS) to inspect student notebooks.
- [x] Textbook ingestion mode supporting PDF, PNG, JPG uploads.
- [x] Multilingual support (English, Hindi, Hinglish auto-switching).
- [x] Built-in Class 2 Mathematics Demo Lesson ("Addition up to 20").
- [x] Local Dev Classroom Fallback Mode when `GEMINI_API_KEY` is absent.

---

## 🔮 Future Milestones (Phase 2 & Beyond)
- [ ] Implement `HeyGenAvatarAdapter` using HeyGen Streaming WebRTC SDK for photorealistic live avatar rendering.
- [ ] Implement `DIDAvatarAdapter` for D-ID real-time avatar option.
- [ ] Multi-subject expansion (Science: Plants & Solar System, English: Story Reading & Grammar).
- [ ] Firestore persistent student state saving across sessions.
- [ ] Speech-to-Speech latency optimization with WebAssembly PCM encoders.
