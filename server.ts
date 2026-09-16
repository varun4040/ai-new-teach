import express from 'express';
import http from 'http';
import path from 'path';
import multer from 'multer';
import * as pdfParseModule from 'pdf-parse';
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { TeacherOrchestrator } from './src/lib/TeacherOrchestrator.js';
import { DEFAULT_CLASSROOM_STATE } from './src/lib/LessonState.js';
import { getEducationalIllustration } from './illustrations.js';

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });

// 1. Health check endpoint
app.get('/api/health', (_req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    geminiApiKeyConfigured: hasKey,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// 2. Textbook Upload and Extraction Endpoint
app.post('/api/textbook/upload', upload.single('file'), async (req: any, res: any) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    let extractedText = '';
    const originalName = file.originalname || 'Textbook_Document.pdf';

    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(file.buffer);
      extractedText = pdfData.text || '';
    } else {
      // Plain text or image fallback text representation
      extractedText = file.buffer.toString('utf-8');
    }

    // Clean text
    extractedText = extractedText.replace(/\s+/g, ' ').trim();
    if (extractedText.length === 0) {
      extractedText = 'Chapter text extracted from document.';
    }

    // Summarize textbook content using Gemini API if available
    let summary = 'Classroom textbook chapter loaded.';
    let keyConcepts = ['Core Concept 1', 'Core Concept 2'];
    let chapterTitle = originalName.replace(/\.[^/.]+$/, '');

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        const prompt = `Analyze this textbook text excerpt for a Class 2 elementary student:
"${extractedText.substring(0, 2000)}"

Return JSON with:
1. "chapterTitle": short title
2. "summary": 2 sentence summary
3. "keyConcepts": array of 3 string key concepts taught
`;

        const modelsToTry = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];
        let response: any = null;
        for (const modelName of modelsToTry) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: { responseMimeType: 'application/json' },
            });
            if (response?.text) break;
          } catch (mErr: any) {
            console.log(`[Textbook AI] Model ${modelName} unavailable (${mErr?.status || 'retry'}), trying alternate...`);
          }
        }

        if (response?.text) {
          const parsed = JSON.parse(response.text);
          chapterTitle = parsed.chapterTitle || chapterTitle;
          summary = parsed.summary || summary;
          keyConcepts = parsed.keyConcepts || keyConcepts;
        }
      } catch (err: any) {
        console.log('[Textbook AI] Using robust text extraction fallback.');
      }
    }

    res.json({
      success: true,
      textbook: {
        fileName: originalName,
        subject: 'Mathematics',
        gradeClass: 2,
        chapterTitle,
        summary,
        keyConcepts,
        rawText: extractedText.substring(0, 4000),
      },
    });
  } catch (error: any) {
    console.log('[Textbook AI] Upload error handling active.');
    res.status(500).json({ error: error.message || 'Failed to extract textbook content' });
  }
});

// 2.5 Gemini Imagen AI Image Generation Endpoint for Whiteboard
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        imageUrl: getEducationalIllustration(prompt),
        notice: 'Interactive educational illustration generated for the whiteboard.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              text: `Friendly, colorful elementary school educational illustration for Class 2 students: ${prompt}, high quality, clear, engaging, cartoon style`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: '4:3',
          },
        },
      });

      let imageUrl: string | null = null;
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        return res.json({ success: true, imageUrl });
      }
    } catch (genErr: any) {
      console.log(`[Image Generation] Gemini image quota limit (${genErr?.status || 429}). Switching to educational illustration renderer.`);
    }

    return res.json({
      success: true,
      imageUrl: getEducationalIllustration(prompt),
      notice: 'Interactive educational illustration generated for the whiteboard.',
    });
  } catch (error: any) {
    const fallbackPrompt = req.body?.prompt || 'education';
    return res.json({
      success: true,
      imageUrl: getEducationalIllustration(fallbackPrompt),
      notice: 'Interactive educational illustration generated for the whiteboard.',
    });
  }
});

// 3. Fallback Chat API Endpoint (REST)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, classroomState, textbook } = req.body;
    const state = classroomState || DEFAULT_CLASSROOM_STATE;

    if (!process.env.GEMINI_API_KEY) {
      // Dev mode response when GEMINI_API_KEY is not set
      const isMathAdd = message?.toLowerCase().includes('apple') || message?.toLowerCase().includes('add') || message?.toLowerCase().includes('8') || message?.toLowerCase().includes('5');
      
      let replyText = `Let's work through this step by step together! Look at our whiteboard.`;
      let toolCall: any = null;

      if (isMathAdd) {
        replyText = `Let's see it on the whiteboard! Here are 5 red apples, and 3 green apples underneath. Count them with me!`;
        toolCall = {
          type: 'show_objects',
          payload: {
            object: 'apple',
            count: 8,
            group1: 5,
            group2: 3,
            label: '5 Red Apples + 3 Green Apples = 8 Apples Total',
            symbol: '+',
          },
        };
      } else if (message?.toLowerCase().includes('line')) {
        replyText = `I've drawn a number line from 0 to 10 for us on the whiteboard!`;
        toolCall = {
          type: 'draw_number_line',
          payload: { min: 0, max: 10, highlightNumber: 8, label: 'Addition Number Line' },
        };
      } else {
        replyText = `That's a great question, ${state.student.name}! Let's write down our main concept on the whiteboard.`;
        toolCall = {
          type: 'show_text',
          payload: {
            title: `Class ${state.student.gradeClass} ${state.subject}`,
            text: message || 'Let us explore math together!',
            highlight: state.currentConcept,
          },
        };
      }

      return res.json({
        text: replyText,
        toolCall,
        mode: 'dev_offline',
        notice: 'GEMINI_API_KEY environment variable not configured. Running in local dev fallback mode.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const systemInstruction = TeacherOrchestrator.getSystemInstruction(state, textbook);
    const tools = [
      { functionDeclarations: TeacherOrchestrator.getToolDeclarations() }
    ];

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: message || 'Hello Ms. Priya!',
          config: {
            systemInstruction,
            tools: tools as any,
          },
        });
        if (response) break;
      } catch (err: any) {
        console.log(`[Teacher AI] Model ${modelName} notice (${err?.message || err?.status || 'retry'}), checking alternate model...`);
        lastError = err;
      }
    }

    if (response) {
      let toolCall: any = null;

      if (response.functionCalls && response.functionCalls.length > 0) {
        const fc = response.functionCalls[0];
        toolCall = {
          type: fc.name,
          payload: fc.args,
        };
      }

      let replyText = response.text;
      if (!replyText && toolCall) {
        // Provide friendly teacher spoken phrase for tool call
        switch (toolCall.type) {
          case 'show_objects':
            replyText = toolCall.payload.label || `Let's count these ${toolCall.payload.count || ''} ${toolCall.payload.object || 'objects'} together on the whiteboard!`;
            break;
          case 'draw_number_line':
            replyText = `I've drawn a number line for us! Look how we can jump forward step by step.`;
            break;
          case 'show_multiple_choice':
            replyText = `Here is a fun question for you on our digital whiteboard! Which answer do you think is correct?`;
            break;
          case 'show_equation':
            replyText = `Let's work through this step on the whiteboard together: ${toolCall.payload.equation || ''}`;
            break;
          case 'show_text':
            replyText = toolCall.payload.title ? `${toolCall.payload.title}: ${toolCall.payload.text}` : toolCall.payload.text;
            break;
          default:
            replyText = `Let's look right here on our digital whiteboard together, ${state.student.name}!`;
            break;
        }
      }

      replyText = replyText || 'Let us continue learning together!';

      return res.json({
        text: replyText,
        toolCall,
        mode: 'live_gemini',
      });
    }

    // If all models failed or are experiencing quota/high-demand spikes, trigger intelligent local teacher fallback
    console.log('[Teacher AI] Activating intelligent classroom teacher fallback engine.');

    const textLower = (message || '').toLowerCase();
    let replyText = `Let's explore ${state.subject} together, ${state.student.name}!`;
    let toolCall: any = null;

    if (textLower.includes('point') || textLower.includes('look') || textLower.includes('show')) {
      replyText = `Look right here on the whiteboard, ${state.student.name}! I am pointing at our main concept.`;
      toolCall = {
        type: 'point_to_element',
        payload: {
          target: 'step_1',
          x: 50,
          y: 45,
          label: `Ms. Priya pointing at ${state.currentConcept || state.chapter}`,
          pointerType: 'hand',
        },
      };
    } else if (state.subject === 'Mathematics' && (textLower.includes('apple') || textLower.includes('add') || textLower.includes('plus') || textLower.includes('count') || textLower.includes('sum'))) {
      replyText = `Let's see it on the whiteboard! Here are 5 red apples plus 3 green apples. Count them with me: 5 + 3 = 8!`;
      toolCall = {
        type: 'show_objects',
        payload: {
          object: 'apple',
          count: 8,
          group1: 5,
          group2: 3,
          label: '5 Red Apples + 3 Green Apples = 8 Apples Total',
          symbol: '+',
        },
      };
    } else if (state.subject === 'Mathematics' && (textLower.includes('line') || textLower.includes('number line') || textLower.includes('jump'))) {
      replyText = `I've drawn a number line for us on the whiteboard! See how we start at 0 and jump forward to 8.`;
      toolCall = {
        type: 'draw_number_line',
        payload: { min: 0, max: 10, highlightNumber: 8, label: 'NCERT Math Number Line' },
      };
    } else if (textLower.includes('quiz') || textLower.includes('question') || textLower.includes('test')) {
      replyText = `Here is a fun pop quiz for you, ${state.student.name}! Can you pick the correct answer on the whiteboard?`;
      toolCall = {
        type: 'show_multiple_choice',
        payload: {
          question: `What is 5 + 3?`,
          options: ['6', '7', '8', '9'],
          answerIndex: 2,
          explanation: 'Great job! 5 apples plus 3 apples equals 8 apples in total!',
        },
      };
    } else if (state.subject === 'Mathematics' && (textLower.includes('shape') || textLower.includes('circle') || textLower.includes('square'))) {
      replyText = `Shapes are so exciting! A circle is round like a coin, and a square has 4 equal sides. Let's look at them on the board!`;
      toolCall = {
        type: 'show_text',
        payload: {
          title: 'Class 2 Shapes & Spatial Understanding',
          text: '🔵 Circle: 0 corners, perfectly round\n🟦 Square: 4 equal sides & 4 corners\n📐 Triangle: 3 sides & 3 corners',
          highlight: 'Basic Geometry',
        },
      };
    } else {
      replyText = `That's a wonderful question about ${state.chapter || state.subject}, ${state.student.name}! Let's review this together on our digital whiteboard.`;
      toolCall = {
        type: 'show_text',
        payload: {
          title: `Class ${state.student.gradeClass} • ${state.subject}`,
          text: message ? `Topic: "${message}"` : `Lesson Goal: ${state.lessonObjective || state.chapter}`,
          highlight: state.currentConcept || 'Core Concept',
        },
      };
    }

    return res.json({
      text: replyText,
      toolCall,
      mode: 'fallback_offline',
      notice: 'Gemini model high demand temporary spike. Interactive teacher fallback active.',
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/chat:', err);
    res.status(500).json({ error: err.message || 'Error processing teacher request' });
  }
});

// 4. WebSocket Server for Gemini Live streaming
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (ws: WebSocket) => {
  console.log('Client connected to WebSocket Live Teacher stream');

  let liveSession: any = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const systemInstruction = TeacherOrchestrator.getSystemInstruction(DEFAULT_CLASSROOM_STATE);
      const toolDeclarations = TeacherOrchestrator.getToolDeclarations();

      liveSession = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction,
          tools: [{ functionDeclarations: toolDeclarations }] as any,
        },
        callbacks: {
          onmessage: (message: any) => {
            // Handle model turn audio
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              ws.send(JSON.stringify({ type: 'audio', data: audioData }));
            }

            // Handle text transcription if present
            const textContent = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (textContent) {
              ws.send(JSON.stringify({ type: 'transcript', text: textContent }));
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              ws.send(JSON.stringify({ type: 'interrupted' }));
            }

            // Handle function / tool calls
            if (message.toolCall) {
              const calls = message.toolCall.functionCalls || [];
              for (const call of calls) {
                ws.send(
                  JSON.stringify({
                    type: 'tool_call',
                    toolCall: {
                      type: call.name,
                      payload: call.args,
                    },
                  })
                );

                // Acknowledge function response back to Gemini Live
                if (liveSession && call.id) {
                  liveSession.sendToolResponse({
                    functionResponses: [
                      {
                        name: call.name,
                        response: { output: { status: 'success', message: 'Whiteboard updated on student screen' } },
                        id: call.id,
                      },
                    ],
                  });
                }
              }
            }
          },
          onerror: (err: any) => {
            console.log('[Gemini Live] Session notice:', err?.message || 'Live session notice');
            ws.send(JSON.stringify({ type: 'error', error: err?.message || 'Live session error' }));
          },
          onclose: () => {
            console.log('Gemini Live API session closed');
          },
        },
      });

      ws.send(JSON.stringify({ type: 'connected', mode: 'live_gemini' }));
    } catch (error: any) {
      console.log('[Gemini Live] Falling back to interactive teacher orchestrator.');
      ws.send(
        JSON.stringify({
          type: 'connected',
          mode: 'dev_offline',
          notice: 'Gemini Live connection fallback. Using local Dev Orchestrator.',
        })
      );
    }
  } else {
    ws.send(
      JSON.stringify({
        type: 'connected',
        mode: 'dev_offline',
        notice: 'GEMINI_API_KEY missing. Local dev classroom active.',
      })
    );
  }

  // Handle incoming messages from browser client
  ws.on('message', async (data: any) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'audio_chunk' && msg.audio) {
        if (liveSession) {
          liveSession.sendRealtimeInput({
            audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } else if (msg.type === 'video_frame' && msg.image) {
        if (liveSession) {
          liveSession.sendRealtimeInput({
            video: { data: msg.image, mimeType: 'image/jpeg' },
          });
        }
      } else if (msg.type === 'text_message' && msg.text) {
        if (liveSession) {
          liveSession.sendRealtimeInput({
            text: msg.text,
          });
        } else {
          const textLower = msg.text.toLowerCase();
          const currentSubject = msg.classroomState?.subject || 'Mathematics';
          const currentChapter = msg.classroomState?.chapter || 'General Lesson';
          let replyText = `Let's explore ${currentSubject} together!`;
          let toolCall: any = null;

          if (currentSubject === 'Mathematics' && (textLower.includes('8') || textLower.includes('5') || textLower.includes('apple') || textLower.includes('add'))) {
            replyText = `Let's see it on the whiteboard! Here are 5 apples on top and 3 apples underneath. Count them with me!`;
            toolCall = {
              type: 'show_objects',
              payload: {
                object: 'apple',
                count: 8,
                group1: 5,
                group2: 3,
                label: '5 Red Apples + 3 Green Apples = 8 Apples Total',
                symbol: '+',
              },
            };
          } else if (currentSubject === 'Mathematics' && (textLower.includes('number line') || textLower.includes('line'))) {
            replyText = `I've drawn a number line for us! See how we jump forward from 5 to 8.`;
            toolCall = {
              type: 'draw_number_line',
              payload: { min: 0, max: 10, highlightNumber: 8, label: 'Addition Jumps' },
            };
          } else {
            replyText = `Wonderful question about ${currentChapter}! Let me write down our key concept on the whiteboard.`;
            toolCall = {
              type: 'show_text',
              payload: {
                title: `Class 2 • ${currentSubject}`,
                text: msg.text,
                highlight: currentChapter,
              },
            };
          }

          ws.send(JSON.stringify({ type: 'transcript', text: replyText }));
          if (toolCall) {
            ws.send(JSON.stringify({ type: 'tool_call', toolCall }));
          }
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
    if (liveSession) {
      try {
        liveSession.close();
      } catch (e) {}
    }
  });
});

// Upgrade WebSocket request
server.on('upgrade', (request, socket, head) => {
  try {
    const host = request.headers.host || 'localhost';
    const url = new URL(request.url || '', `http://${host}`);
    if (url.pathname === '/ws/live' || url.pathname === '/live' || url.pathname.startsWith('/ws')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  } catch (e) {
    console.error('Error handling WebSocket upgrade:', e);
  }
  // Note: Do NOT call socket.destroy() here so Vite dev server can handle HMR upgrades
});

// Integrate Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Live Teacher server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
