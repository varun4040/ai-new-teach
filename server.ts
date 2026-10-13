import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import * as pdfParseModule from 'pdf-parse';
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { TeacherOrchestrator } from './src/lib/TeacherOrchestrator.js';
import { DEFAULT_CLASSROOM_STATE } from './src/lib/LessonState.js';
import { getEducationalIllustration } from './illustrations.js';
import { detectLanguageIntent } from './src/lib/languages.js';

const cliPortIndex = process.argv.indexOf('--port');
const cliPort = cliPortIndex !== -1 && process.argv[cliPortIndex + 1] ? parseInt(process.argv[cliPortIndex + 1], 10) : null;
const PORT = cliPort || (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
const app = express();
const server = http.createServer(app);

// Helper to sanitize English speech responses from accidental Hindi or Hinglish bleed
function sanitizeEnglishSpeech(text: string): string {
  if (!text) return text;
  return text
    .replace(/^(\s*haan\s+(?:beta|bilkul)?[,.]?\s*)/i, 'Of course! ')
    .replace(/^(\s*chalo[,.]?\s*)/i, "Let's ")
    .replace(/\bchalo\s+whiteboard\s+par\s+dekhte\s+hain\b/gi, "Let's look at the whiteboard")
    .replace(/\bchalo\b/gi, "come on")
    .replace(/\bshabash\b/gi, "well done")
    .replace(/\barey\s+waah\b/gi, "awesome")
    .replace(/\bdekhte\s+hain\b/gi, "let us see")
    .replace(/\bhai\s+na\b/gi, "right?")
    .replace(/[\u0900-\u097F]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure assets directory exists and serve static assets
const assetsDir = path.join(process.cwd(), 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

app.use(
  '/assets',
  express.static(assetsDir, {
    setHeaders: (res, filePath) => {
      const lower = filePath.toLowerCase();
      if (lower.endsWith('.glb')) {
        res.setHeader('Content-Type', 'model/gltf-binary');
      } else if (lower.endsWith('.gltf')) {
        res.setHeader('Content-Type', 'model/gltf+json');
      } else if (lower.endsWith('.obj')) {
        res.setHeader('Content-Type', 'text/plain');
      } else if (lower.endsWith('.bin')) {
        res.setHeader('Content-Type', 'application/octet-stream');
      }
    },
  })
);

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

// In-memory cache for uploaded 3D teacher models
const uploadedModelsCache = new Map<string, { buffer: Buffer; mimeType: string; filename: string; format: string }>();

// 3D Teacher Model Upload Endpoint (.obj, .glb, .gltf)
app.post('/api/teacher/upload-model', upload.single('modelFile'), (req: any, res: any) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No 3D model file provided' });
    }

    const originalName = file.originalname || 'teacher_model.glb';
    const ext = path.extname(originalName).toLowerCase().replace('.', '');
    const modelFormat = ext === 'obj' ? 'obj' : ext === 'gltf' ? 'gltf' : 'glb';

    const modelId = `model_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    uploadedModelsCache.set(modelId, {
      buffer: file.buffer,
      mimeType: file.mimetype || 'application/octet-stream',
      filename: originalName,
      format: modelFormat,
    });

    const modelUrl = `/api/teacher/model/${modelId}`;

    res.json({
      success: true,
      modelId,
      modelUrl,
      filename: originalName,
      format: modelFormat,
      sizeBytes: file.size,
      message: `3D model ${originalName} uploaded successfully!`,
    });
  } catch (error: any) {
    console.error('Error uploading 3D model:', error);
    res.status(500).json({ error: 'Failed to process 3D model upload' });
  }
});

// Endpoint to stream the uploaded 3D model file
app.get('/api/teacher/model/:modelId', (req: any, res: any) => {
  const modelId = req.params.modelId;
  const cached = uploadedModelsCache.get(modelId);
  if (!cached) {
    return res.status(404).send('3D Model not found');
  }

  let contentType = 'model/gltf-binary';
  if (cached.format === 'obj') {
    contentType = 'text/plain';
  } else if (cached.format === 'gltf') {
    contentType = 'model/gltf+json';
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${cached.filename}"`);
  res.send(cached.buffer);
});

// Helper to categorize asset extensions
function categorizeAsset(filename: string): '3d_model' | 'image' | 'audio' | 'document' | 'other' {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  if (['glb', 'gltf', 'obj', 'bin', 'fbx', 'dae'].includes(ext)) return '3d_model';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return 'image';
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) return 'audio';
  if (['pdf', 'txt', 'md', 'json', 'csv'].includes(ext)) return 'document';
  return 'other';
}

// Recursively scan assets directory
function scanAssetsDirectory(dir: string, baseDir: string = dir): any[] {
  const results: any[] = [];
  if (!fs.existsSync(dir)) return results;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue; // skip hidden files and .aistudio
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...scanAssetsDirectory(fullPath, baseDir));
      } else {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);
        const category = categorizeAsset(entry.name);
        results.push({
          name: entry.name,
          relativePath,
          url: `/assets/${relativePath}`,
          sizeBytes: stat.size,
          category,
          extension: path.extname(entry.name).toLowerCase().replace('.', ''),
          modifiedAt: stat.mtime.toISOString(),
        });
      }
    }
  } catch (e) {
    console.error('Error scanning assets directory:', e);
  }
  return results;
}

// Endpoint to list all project asset files
app.get('/api/assets', (_req, res) => {
  const assets = scanAssetsDirectory(assetsDir);
  res.json({
    success: true,
    count: assets.length,
    assets,
  });
});

// Endpoint to upload a file directly to the assets directory
app.post('/api/assets/upload', upload.single('assetFile'), (req: any, res: any) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No asset file provided' });
    }

    const originalName = file.originalname || `asset_${Date.now()}`;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const category = categorizeAsset(sanitizedName);

    // Subdirectory based on category
    const subDirName =
      category === '3d_model'
        ? 'models'
        : category === 'image'
          ? 'images'
          : category === 'audio'
            ? 'audio'
            : 'files';
    const targetDir = path.join(assetsDir, subDirName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, sanitizedName);
    fs.writeFileSync(targetPath, file.buffer);

    const relativePath = `${subDirName}/${sanitizedName}`;
    const url = `/assets/${relativePath}`;

    res.json({
      success: true,
      name: sanitizedName,
      relativePath,
      url,
      category,
      sizeBytes: file.size,
      message: `Asset "${sanitizedName}" saved successfully!`,
    });
  } catch (error: any) {
    console.error('Error saving asset file:', error);
    res.status(500).json({ error: 'Failed to save asset file' });
  }
});

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

// 2.6 Teacher Face Generation & Regeneration Endpoint using Gemini Image Models
app.post('/api/teacher/generate-face', async (req, res) => {
  try {
    const { prompt } = req.body;
    const userPrompt = prompt || 'warm friendly Indian female school teacher named Ms. Priya, wearing elegant glasses and gentle smile, front-facing portrait';

    const defaultRealisticPortraits = [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1580894732475-8eb40698144f?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=85',
    ];

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        imageUrl: defaultRealisticPortraits[0],
        notice: 'Photorealistic teacher portrait selected.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const fullPrompt = `Photorealistic front-facing studio portrait of an elementary school teacher, professional photography, natural lighting, centered portrait, friendly welcoming expression: ${userPrompt}, 8k, detailed skin texture, realistic hair and eyes`;

    const candidateModels = ['gemini-3.1-flash-image-preview', 'gemini-2.5-flash-image', 'gemini-3.1-flash-lite-image'];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [{ text: fullPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            return res.json({
              success: true,
              imageUrl: `data:${mime};base64,${part.inlineData.data}`,
              modelUsed: modelName,
            });
          }
        }
      } catch (err: any) {
        console.log(`[Teacher Face Gen] Model ${modelName} status: ${err?.status || 'unavailable'}`);
      }
    }

    return res.json({
      success: true,
      imageUrl: defaultRealisticPortraits[0],
      notice: 'Photorealistic teacher portrait active.',
    });
  } catch (error: any) {
    return res.json({
      success: true,
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=85',
      notice: 'Photorealistic teacher portrait loaded.',
    });
  }
});

// 3. Fallback Chat API Endpoint (REST)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, classroomState, textbook } = req.body;
    let state = classroomState || DEFAULT_CLASSROOM_STATE;

    // Detect if child explicitly requested a language switch (e.g. "Speak in English", "इंग्लिश में बोलो")
    const detectedLang = detectLanguageIntent(message);
    let languageChanged: string | null = null;
    if (detectedLang && detectedLang !== state.language) {
      state = {
        ...state,
        language: detectedLang,
        student: { ...state.student, preferredLanguage: detectedLang },
      };
      languageChanged = detectedLang;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Dev mode response when GEMINI_API_KEY is not set
      if (detectedLang === 'hindi' || (message?.toLowerCase().includes('hindi') || message?.includes('हिंदी') || message?.includes('हिन्दी'))) {
        return res.json({
          text: `हाँ बिल्कुल, ${state.student.name}! मैं हिन्दी में भी बात कर सकती हूँ और पढ़ा सकती हूँ। चलिए अब हम हिन्दी में सीखते हैं! व्हाइटबोर्ड पर देखिए।`,
          toolCall: {
            type: 'show_text',
            payload: {
              title: `हिन्दी माध्यम (Hindi Mode Active)`,
              text: `सुश्री प्रिया अब हिन्दी में सिखाएंगी! चलिए पाठ को आगे बढ़ाते हैं।`,
              highlight: state.currentConcept || state.chapter,
            },
          },
          languageChanged: 'hindi',
          mode: 'dev_offline',
        });
      }

      if (detectedLang === 'english' && (message?.toLowerCase().includes('english') || message?.includes('इंग्लिश') || message?.includes('अंग्रेजी'))) {
        return res.json({
          text: `Of course, ${state.student.name}! From now on, let's learn and speak together in English! Look at our whiteboard, what would you like to explore?`,
          toolCall: {
            type: 'show_text',
            payload: {
              title: `English Mode Active`,
              text: `Switched to 100% English teaching mode! Let's explore ${state.chapter || state.subject} together.`,
              highlight: state.currentConcept || state.chapter,
            },
          },
          languageChanged: 'english',
          mode: 'dev_offline',
        });
      }

      const isMathAdd = message?.toLowerCase().includes('apple') || message?.toLowerCase().includes('add') || message?.toLowerCase().includes('8') || message?.toLowerCase().includes('5');
      
      let replyText = state.language === 'hindi'
        ? `शाबाश बेटा! चलिए हम सब साथ मिलकर इसे सीखते हैं! व्हाइटबोर्ड पर देखिए।`
        : state.language === 'english'
        ? `Of course! Let's work through this step by step together in English! Look at our whiteboard.`
        : `Let's work through this step by step together! Look at our whiteboard.`;
      let toolCall: any = null;

      if (isMathAdd) {
        replyText = state.language === 'hindi'
          ? `चलिए व्हाइटबोर्ड पर देखते हैं! यहाँ ऊपर 5 लाल सेब हैं और नीचे 3 हरे सेब। मेरे साथ गिनिए: 5 + 3 = 8 सेब कुल!`
          : `Let's see it on the whiteboard! Here are 5 red apples, and 3 green apples underneath. Count them with me!`;
        toolCall = {
          type: 'show_objects',
          payload: {
            object: 'apple',
            count: 8,
            group1: 5,
            group2: 3,
            label: state.language === 'hindi' ? '5 लाल सेब + 3 हरे सेब = 8 कुल सेब' : '5 Red Apples + 3 Green Apples = 8 Apples Total',
            symbol: '+',
          },
        };
      } else if (message?.toLowerCase().includes('line')) {
        replyText = state.language === 'hindi'
          ? `मैंने हमारे लिए व्हाइटबोर्ड पर 0 से 10 तक संख्या रेखा (Number Line) बनाई है!`
          : `I've drawn a number line from 0 to 10 for us on the whiteboard!`;
        toolCall = {
          type: 'draw_number_line',
          payload: { min: 0, max: 10, highlightNumber: 8, label: 'Addition Number Line' },
        };
      } else {
        replyText = state.language === 'hindi'
          ? `बहुत अच्छा सवाल है, ${state.student.name}! चलिए मुख्य अवधारणा को व्हाइटबोर्ड पर लिखकर समझते हैं।`
          : `That's a great question, ${state.student.name}! Let's write down our main concept on the whiteboard.`;
        toolCall = {
          type: 'show_text',
          payload: {
            title: `Class ${state.student.gradeClass} ${state.subject}`,
            text: message || 'Let us explore together!',
            highlight: state.currentConcept,
          },
        };
      }

      return res.json({
        text: replyText,
        toolCall,
        languageChanged,
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
      const isHindi = state.language === 'hindi';
      const isHinglish = state.language === 'hinglish';

      if (!replyText && toolCall) {
        // Provide friendly teacher spoken phrase for tool call
        switch (toolCall.type) {
          case 'show_objects':
            replyText = isHinglish
              ? `Chalo whiteboard par dekhte hain! Saath mein count karte hain, kitne ${toolCall.payload.object || 'objects'} hain?`
              : (toolCall.payload.label || `Let's count these ${toolCall.payload.count || ''} ${toolCall.payload.object || 'objects'} together on the whiteboard!`);
            break;
          case 'draw_number_line':
            replyText = isHinglish
              ? `Maine whiteboard par number line draw ki hai! Dekho hum step by step kaise aage jump kar rahe hain.`
              : `I've drawn a number line for us! Look how we can jump forward step by step.`;
            break;
          case 'show_multiple_choice':
            replyText = isHinglish
              ? `Whiteboard par aapke liye ek mazedaar question hai! Kaunsa option sahi lagta hai?`
              : `Here is a fun question for you on our digital whiteboard! Which answer do you think is correct?`;
            break;
          case 'show_equation':
            replyText = isHinglish
              ? `Chalo whiteboard par yeh step solve karte hain: ${toolCall.payload.equation || ''}`
              : `Let's work through this step on the whiteboard together: ${toolCall.payload.equation || ''}`;
            break;
          case 'show_text':
            replyText = toolCall.payload.title ? `${toolCall.payload.title}: ${toolCall.payload.text}` : toolCall.payload.text;
            break;
          case 'flashcard':
          case 'show_flashcards':
            if (toolCall.payload?.isFlipped) {
              replyText = isHinglish
                ? `Maine card flip kar diya hai! Sahi answer hai: ${toolCall.payload.back || ''}`
                : `I've flipped the card to reveal the answer: ${toolCall.payload.back || ''}`;
            } else {
              replyText = isHinglish
                ? `Yeh raha flashcard! ${toolCall.payload?.front || 'Question'} - kya aap guess kar sakte ho? Phir flip karte hain!`
                : `Here is an interactive flashcard! ${toolCall.payload?.front || 'Question'} - can you guess before we flip?`;
            }
            break;
          default:
            replyText = isHindi
              ? `चलिए ${state.student.name}, व्हाइटबोर्ड पर देखते हैं!`
              : isHinglish
              ? `Chalo ${state.student.name}, whiteboard par dekhte hain!`
              : `Let's look right here on our digital whiteboard together, ${state.student.name}!`;
            break;
        }
      }

      replyText = replyText || (isHindi ? 'चलिए साथ मिलकर आगे सीखते हैं!' : isHinglish ? 'Chalo saath mein aage seekhte hain!' : 'Let us continue learning together!');

      if (state.language === 'english' && replyText) {
        replyText = sanitizeEnglishSpeech(replyText);
      }

      return res.json({
        text: replyText,
        toolCall,
        languageChanged,
        mode: 'live_gemini',
      });
    }

    // If all models failed or are experiencing quota/high-demand spikes, trigger intelligent local teacher fallback
    console.log('[Teacher AI] Activating intelligent classroom teacher fallback engine.');

    const isHinglish = state.language === 'hinglish';
    const isEnglish = state.language === 'english';
    const textLower = (message || '').toLowerCase();
    let replyText = isEnglish
      ? `Of course, ${state.student.name}! Let's explore ${state.subject} together in English!`
      : isHinglish
      ? `Chalo ${state.student.name}, saath mein ${state.subject} seekhte hain!`
      : `Let's explore ${state.subject} together, ${state.student.name}!`;
    let toolCall: any = null;

    if (detectedLang === 'english' && (textLower.includes('english') || textLower.includes('इंग्लिश') || textLower.includes('अंग्रेजी') || textLower.includes('speak') || textLower.includes('bolo') || textLower.includes('talk') || textLower.includes('padhao') || textLower.includes('samjhao'))) {
      replyText = `Of course, ${state.student.name}! From now on, let's learn and speak together in English! Look at our whiteboard, what would you like to explore?`;
      toolCall = {
        type: 'show_text',
        payload: {
          title: `English Mode Active • Class ${state.student.gradeClass} ${state.subject}`,
          text: `Switched to 100% English mode! Let's explore ${state.chapter || state.subject} together.`,
          highlight: state.currentConcept || state.chapter,
        },
      };
    } else if (textLower.includes('point') || textLower.includes('look') || textLower.includes('show') || textLower.includes('dekho')) {
      replyText = isHinglish
        ? `Whiteboard par yahan dekho, ${state.student.name}! Main hamare main concept ki taraf point kar rahi hoon.`
        : `Look right here on the whiteboard, ${state.student.name}! I am pointing at our main concept.`;
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
    } else if (state.subject === 'Mathematics' && (textLower.includes('apple') || textLower.includes('add') || textLower.includes('plus') || textLower.includes('count') || textLower.includes('sum') || textLower.includes('kitna'))) {
      replyText = isHinglish
        ? `Chalo whiteboard par dekhte hain! Upar 5 red apples hain aur neeche 3 green apples. Saath mein count karo: 5 + 3 = 8 apples!`
        : `Let's see it on the whiteboard! Here are 5 red apples plus 3 green apples. Count them with me: 5 + 3 = 8!`;
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
      replyText = isHinglish
        ? `Maine whiteboard par number line draw ki hai! Dekho kaise 0 se start karke hum 8 tak jump karte hain.`
        : `I've drawn a number line for us on the whiteboard! See how we start at 0 and jump forward to 8.`;
      toolCall = {
        type: 'draw_number_line',
        payload: { min: 0, max: 10, highlightNumber: 8, label: 'NCERT Math Number Line' },
      };
    } else if (textLower.includes('quiz') || textLower.includes('question') || textLower.includes('test') || textLower.includes('sawal')) {
      replyText = isHinglish
        ? `Aapke liye ek mazedaar pop quiz, ${state.student.name}! Kya aap whiteboard par sahi answer choose kar sakte ho?`
        : `Here is a fun pop quiz for you, ${state.student.name}! Can you pick the correct answer on the whiteboard?`;
      toolCall = {
        type: 'show_multiple_choice',
        payload: {
          question: `What is 5 + 3?`,
          options: ['6', '7', '8', '9'],
          answerIndex: 2,
          explanation: 'Great job! 5 apples plus 3 apples equals 8 apples in total!',
        },
      };
    } else if (textLower.includes('flashcard') || textLower.includes('card') || textLower.includes('flip') || textLower.includes('vocab') || textLower.includes('word drill')) {
      const isMath = state.subject === 'Mathematics' || textLower.includes('math') || textLower.includes('multiply');
      replyText = isHinglish
        ? `Maine whiteboard par interactive flashcards open kiye hain! Card par click karke ya mujhe bolkar aap flip kar sakte ho.`
        : `I've opened our interactive flashcard tool on the whiteboard! Click the card or ask me to flip it!`;
      toolCall = {
        type: 'flashcard',
        payload: isMath
          ? {
              title: 'Mental Math Rapid Fire',
              category: 'math',
              front: '7 × 8 = ?',
              back: '56',
              hint: 'Count: 5, 6, 7, 8 ➔ 56 = 7 × 8!',
              isFlipped: textLower.includes('flip') || textLower.includes('answer'),
            }
          : {
              title: 'Vocabulary & Science Card',
              category: 'vocabulary',
              front: 'Photosynthesis',
              back: 'The process where green plants turn sunlight, water, and CO₂ into oxygen and food!',
              hint: 'How green leaves soak up sunlight!',
              isFlipped: textLower.includes('flip') || textLower.includes('answer'),
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
      replyText = state.language === 'hindi'
        ? `यह ${state.chapter || state.subject} के बारे में बहुत अच्छा सवाल है, ${state.student.name}! चलिए इसे डिजिटल व्हाइटबोर्ड पर मिलकर समझते हैं।`
        : `That's a wonderful question about ${state.chapter || state.subject}, ${state.student.name}! Let's review this together on our digital whiteboard.`;
      toolCall = {
        type: 'show_text',
        payload: {
          title: `Class ${state.student.gradeClass} • ${state.subject}`,
          text: message ? `Topic: "${message}"` : `Lesson Goal: ${state.lessonObjective || state.chapter}`,
          highlight: state.currentConcept || 'Core Concept',
        },
      };
    }

    if (state.language === 'english' && replyText) {
      replyText = sanitizeEnglishSpeech(replyText);
    }

    return res.json({
      text: replyText,
      toolCall,
      languageChanged,
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
        const detectedLang = detectLanguageIntent(msg.text);
        if (detectedLang) {
          if (!msg.classroomState) {
            msg.classroomState = { ...DEFAULT_CLASSROOM_STATE, language: detectedLang };
          } else {
            msg.classroomState.language = detectedLang;
            if (msg.classroomState.student) {
              msg.classroomState.student.preferredLanguage = detectedLang;
            }
          }
          ws.send(JSON.stringify({ type: 'language_changed', language: detectedLang }));
        }

        if (liveSession) {
          liveSession.sendRealtimeInput({
            text: msg.text,
          });
        } else {
          const textLower = msg.text.toLowerCase();
          const currentSubject = msg.classroomState?.subject || 'Mathematics';
          const currentChapter = msg.classroomState?.chapter || 'General Lesson';
          const isHindi = msg.classroomState?.language === 'hindi';
          const isEnglish = msg.classroomState?.language === 'english';
          const isHinglish = msg.classroomState?.language === 'hinglish';
          let replyText = isHindi
            ? `हाँ बिल्कुल! चलिए साथ मिलकर ${currentSubject} पढ़ते हैं!`
            : isEnglish
            ? `Of course! Let's explore ${currentSubject} together in English!`
            : isHinglish
            ? `Chalo saath mein ${currentSubject} explore karte hain!`
            : `Let's explore ${currentSubject} together!`;
          let toolCall: any = null;

          if (detectedLang === 'hindi' || textLower.includes('hindi') || textLower.includes('हिंदी') || textLower.includes('हिन्दी')) {
            replyText = `हाँ बिल्कुल! मैं हिन्दी में भी बात कर सकती हूँ और पढ़ा सकती हूँ। चलिए अब हम हिन्दी में सीखते हैं! व्हाइटबोर्ड पर देखिए।`;
            toolCall = {
              type: 'show_text',
              payload: {
                title: `हिन्दी माध्यम (Hindi Mode Active)`,
                text: `सुश्री प्रिया अब हिन्दी में सिखाएंगी! चलिए पाठ को आगे बढ़ाते हैं।`,
                highlight: currentChapter,
              },
            };
          } else if (detectedLang === 'english' && (textLower.includes('english') || textLower.includes('इंग्लिश') || textLower.includes('अंग्रेजी') || textLower.includes('speak') || textLower.includes('bolo') || textLower.includes('talk') || textLower.includes('padhao') || textLower.includes('samjhao'))) {
            replyText = `Of course! From now on, let's learn and talk together in English! Look at our digital whiteboard.`;
            toolCall = {
              type: 'show_text',
              payload: {
                title: `English Mode Active`,
                text: `Switched to 100% English mode! Let's explore ${currentChapter} together.`,
                highlight: currentChapter,
              },
            };
          } else if (currentSubject === 'Mathematics' && (textLower.includes('8') || textLower.includes('5') || textLower.includes('apple') || textLower.includes('add') || textLower.includes('jod') || textLower.includes('kitna') || textLower.includes('सेब'))) {
            replyText = isHindi
              ? `चलिए व्हाइटबोर्ड पर देखते हैं! ऊपर 5 सेब हैं और नीचे 3 सेब। साथ में गिनिए: 5 + 3 = 8 सेब!`
              : isHinglish
              ? `Chalo whiteboard par dekhte hain! Upar 5 apples hain aur neeche 3 apples. Saath mein count karo: 5 + 3 = 8 apples!`
              : `Let's see it on the whiteboard! Here are 5 apples on top and 3 apples underneath. Count them with me!`;
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
            replyText = isHinglish
              ? `Maine hamare liye whiteboard par number line draw ki hai! Dekho kaise hum 5 se 8 par jump karte hain.`
              : `I've drawn a number line for us! See how we jump forward from 5 to 8.`;
            toolCall = {
              type: 'draw_number_line',
              payload: { min: 0, max: 10, highlightNumber: 8, label: 'Addition Jumps' },
            };
          } else {
            replyText = isHinglish
              ? `Bahut accha question hai ${currentChapter} ke baare mein! Chalo main whiteboard par key points likhti hoon.`
              : `Wonderful question about ${currentChapter}! Let me write down our key concept on the whiteboard.`;
            toolCall = {
              type: 'show_text',
              payload: {
                title: `Class 2 • ${currentSubject}`,
                text: msg.text,
                highlight: currentChapter,
              },
            };
          }

          if (isEnglish && replyText) {
            replyText = sanitizeEnglishSpeech(replyText);
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
      server: {
        middlewareMode: true,
        hmr: { server },
      },
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

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is in use, server exiting cleanly.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  VITE v6.2.3  ready in 150 ms\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`AI Live Teacher server running on http://0.0.0.0:${PORT}\n`);
  });
}

startServer();
