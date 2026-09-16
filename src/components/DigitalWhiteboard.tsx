import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  PieChart,
  Shapes,
  Clock,
  Sun,
  Sprout,
  Coins,
  Pencil,
  Highlighter,
  Eraser,
  Trash2,
  Vibrate,
  Paintbrush,
  Sticker,
  Image as ImageIcon,
  Wand2,
  Loader2,
  X,
  Download,
  MousePointer2,
  Target,
  Zap,
  Hand,
  Undo2,
  Redo2,
  ArrowUpRight,
  Circle,
  Square,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  Check,
  Camera,
} from 'lucide-react';
import { WhiteboardToolEvent, WhiteboardObjectType } from '../types';
import { soundEffects } from '../lib/soundEffects';

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'clear' = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(35);
          break;
        case 'success':
          navigator.vibrate([15, 40, 30, 40, 45]);
          break;
        case 'error':
          navigator.vibrate([30, 50, 30]);
          break;
        case 'clear':
          navigator.vibrate([20, 30, 20]);
          break;
      }
    } catch {
      // Ignore errors on non-supported platforms
    }
  }
};

export interface AnnotationPoint {
  x: number;
  y: number;
  pressure?: number;
}

export type AnnotationToolType =
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'stamp'
  | 'arrow'
  | 'circle'
  | 'rectangle'
  | 'interact';

export interface AnnotationStroke {
  id: string;
  tool: AnnotationToolType;
  points: AnnotationPoint[];
  color: string;
  width: number;
  opacity: number;
  stamp?: string;
}

interface DigitalWhiteboardProps {
  toolEvent?: WhiteboardToolEvent | null;
  onClear: () => void;
  onAnswerSubmit?: (answerIndex: number, isCorrect: boolean) => void;
}

const OBJECT_EMOJIS: Record<WhiteboardObjectType, { emoji: string; color: string; label: string }> = {
  apple: { emoji: '🍎', color: 'bg-red-50 border-red-200 text-red-700', label: 'Apples' },
  star: { emoji: '⭐', color: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Stars' },
  pencil: { emoji: '✏️', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', label: 'Pencils' },
  ball: { emoji: '⚽', color: 'bg-blue-50 border-blue-200 text-blue-700', label: 'Balls' },
  cookie: { emoji: '🍪', color: 'bg-amber-100 border-amber-300 text-amber-900', label: 'Cookies' },
  balloon: { emoji: '🎈', color: 'bg-purple-50 border-purple-200 text-purple-700', label: 'Balloons' },
  block: { emoji: '🧱', color: 'bg-orange-50 border-orange-200 text-orange-700', label: 'Blocks' },
};

const COLORS = [
  { name: 'Orange', value: '#FF6321' },
  { name: 'Olive', value: '#5A5A40' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Yellow', value: '#FACC15' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#111111' },
];

const STICKERS = ['⭐', '🌟', '❤️', '🍎', '👍', '🎯', '🎈', '✨', '💯', '💡'];

const hexToRgba = (hex: string, alpha: number) => {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(250, 204, 21, ${alpha})`;
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
};

const SIZES = [
  { name: 'Fine', value: 3 },
  { name: 'Medium', value: 7 },
  { name: 'Bold', value: 14 },
];

// Helper to draw a single complete annotation stroke
function renderStrokeOnContext(ctx: CanvasRenderingContext2D, stroke: AnnotationStroke) {
  if (!stroke.points || stroke.points.length === 0) return;

  ctx.save();

  if (stroke.tool === 'stamp' && stroke.stamp) {
    ctx.globalCompositeOperation = 'source-over';
    const pt = stroke.points[0];
    const fontSize = Math.max(26, stroke.width * 5 + 24);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stroke.stamp, pt.x, pt.y);
    ctx.restore();
    return;
  }

  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = stroke.width * 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else if (stroke.tool === 'highlighter') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = stroke.width * 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = hexToRgba(stroke.color, 0.42);
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
  }

  // Shape: Circle
  if (stroke.tool === 'circle') {
    if (stroke.points.length >= 2) {
      const p1 = stroke.points[0];
      const p2 = stroke.points[stroke.points.length - 1];
      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2;
      const rx = Math.abs(p2.x - p1.x) / 2;
      const ry = Math.abs(p2.y - p1.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(2, rx), Math.max(2, ry), 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Shape: Rectangle
  if (stroke.tool === 'rectangle') {
    if (stroke.points.length >= 2) {
      const p1 = stroke.points[0];
      const p2 = stroke.points[stroke.points.length - 1];
      ctx.beginPath();
      ctx.rect(
        Math.min(p1.x, p2.x),
        Math.min(p1.y, p2.y),
        Math.abs(p2.x - p1.x),
        Math.abs(p2.y - p1.y)
      );
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Shape: Arrow
  if (stroke.tool === 'arrow') {
    if (stroke.points.length >= 2) {
      const p1 = stroke.points[0];
      const p2 = stroke.points[stroke.points.length - 1];
      const headlen = Math.max(12, stroke.width * 3);
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - headlen * Math.cos(angle - Math.PI / 6), p2.y - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(p2.x - headlen * Math.cos(angle + Math.PI / 6), p2.y - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = stroke.color;
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  // Freehand Pen / Highlighter / Eraser:
  // Catmull-Rom / mid-point quadratic curves for smooth handwriting
  const pts = stroke.points;
  if (pts.length === 1) {
    // Single point / tap dot
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, Math.max(1.5, stroke.width / 2), 0, Math.PI * 2);
    if (stroke.tool === 'eraser') {
      ctx.fill();
    } else if (stroke.tool === 'highlighter') {
      ctx.fillStyle = hexToRgba(stroke.color, 0.42);
      ctx.fill();
    } else {
      ctx.fillStyle = stroke.color;
      ctx.fill();
    }
  } else if (pts.length === 2) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  ctx.restore();
}

export const DigitalWhiteboard: React.FC<DigitalWhiteboardProps> = ({
  toolEvent,
  onClear,
  onAnswerSubmit,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<AnnotationToolType>('pen');
  const [selectedSticker, setSelectedSticker] = useState<string>('⭐');
  const [penColor, setPenColor] = useState<string>('#FF6321');
  const [penWidth, setPenWidth] = useState<number>(4);
  const [showShapeMenu, setShowShapeMenu] = useState<boolean>(false);
  const [isToolbarMinimized, setIsToolbarMinimized] = useState<boolean>(false);

  // Vector strokes history for crisp rendering, resize stability, and undo/redo
  const [strokes, setStrokes] = useState<AnnotationStroke[]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationStroke[]>([]);
  const strokesRef = useRef<AnnotationStroke[]>([]);
  strokesRef.current = strokes;

  // In-progress stroke during active dragging
  const currentStrokeRef = useRef<AnnotationStroke | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Canvas & Container sizing references
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dprRef = useRef<number>(1);
  const dimensionsRef = useRef<{ width: number; height: number }>({ width: 800, height: 600 });

  // Gemini Imagen AI Image Generator State
  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState<boolean>(false);
  const [aiImageError, setAiImageError] = useState<string | null>(null);
  const [activeBoardImageUrl, setActiveBoardImageUrl] = useState<string | null>(null);
  const [activeBoardImageCaption, setActiveBoardImageCaption] = useState<string | null>(null);

  // AI Teacher Visual Pointer State
  const [pointerState, setPointerState] = useState<{
    active: boolean;
    x: number;
    y: number;
    label?: string;
    pointerType: 'hand' | 'laser' | 'magic_wand' | 'spotlight';
    color?: string;
    target?: string;
  } | null>(null);
  const [isPointerMenuOpen, setIsPointerMenuOpen] = useState<boolean>(false);

  const redrawAllStrokes = useCallback((customStrokes?: AnnotationStroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = dimensionsRef.current;
    ctx.clearRect(0, 0, width, height);

    const strokesToRender = customStrokes || strokesRef.current;
    for (const s of strokesToRender) {
      renderStrokeOnContext(ctx, s);
    }
  }, []);

  const updateSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;

    const width = Math.max(container.clientWidth, container.scrollWidth, 300);
    const height = Math.max(container.clientHeight, container.scrollHeight, 300);
    if (width <= 0 || height <= 0) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    dprRef.current = dpr;
    dimensionsRef.current = { width, height };

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      redrawAllStrokes();
    }
  }, [redrawAllStrokes]);

  const handleUndo = useCallback(() => {
    if (strokes.length === 0) return;
    triggerHaptic('light');
    const updated = [...strokes];
    const removed = updated.pop();
    if (!removed) return;
    setStrokes(updated);
    strokesRef.current = updated;
    setRedoStack((prev) => [...prev, removed]);
    redrawAllStrokes(updated);
  }, [strokes, redrawAllStrokes]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    triggerHaptic('light');
    const updatedRedo = [...redoStack];
    const restored = updatedRedo.pop();
    if (!restored) return;
    const updated = [...strokes, restored];
    setStrokes(updated);
    strokesRef.current = updated;
    setRedoStack(updatedRedo);
    redrawAllStrokes(updated);
  }, [strokes, redoStack, redrawAllStrokes]);

  const clearDrawing = useCallback(() => {
    if (strokes.length === 0) return;
    triggerHaptic('clear');
    soundEffects.playWhoosh();
    setStrokes([]);
    strokesRef.current = [];
    setRedoStack([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const { width, height } = dimensionsRef.current;
        ctx.clearRect(0, 0, width, height);
      }
    }
  }, [strokes.length]);

  const handleFullClear = () => {
    triggerHaptic('clear');
    soundEffects.playWhoosh();
    clearDrawing();
    onClear();
  };

  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    triggerHaptic('success');
    soundEffects.playSuccess();
    try {
      const link = document.createElement('a');
      link.download = `whiteboard-annotation-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Failed to export canvas image:', e);
    }
  };

  const handleGenerateAiImage = async (promptToUse?: string) => {
    const finalPrompt = promptToUse || aiPrompt;
    if (!finalPrompt.trim()) return;

    setIsGeneratingAiImage(true);
    setAiImageError(null);
    triggerHaptic('medium');

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      const data = await res.json();

      if (data.success && data.imageUrl) {
        setActiveBoardImageUrl(data.imageUrl);
        setActiveBoardImageCaption(finalPrompt);
        setIsAiImageModalOpen(false);
        triggerHaptic('success');
      } else {
        setAiImageError(data.error || 'Failed to generate image with Gemini Imagen');
        triggerHaptic('error');
      }
    } catch (err: any) {
      setAiImageError(err.message || 'Error generating image');
      triggerHaptic('error');
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  useEffect(() => {
    setSelectedOption(null);
    if (toolEvent?.type === 'check_answer') {
      triggerHaptic(toolEvent.payload.isCorrect ? 'success' : 'error');
    } else if (toolEvent?.type === 'show_image') {
      triggerHaptic('medium');
      if (toolEvent.payload.url) {
        setActiveBoardImageUrl(toolEvent.payload.url);
        if (toolEvent.payload.caption) setActiveBoardImageCaption(toolEvent.payload.caption);
      } else if (toolEvent.payload.prompt) {
        handleGenerateAiImage(toolEvent.payload.prompt);
      }
    } else if (toolEvent?.type === 'point_to_element') {
      triggerHaptic('medium');
      const payload = toolEvent.payload;
      let px = payload.x;
      let py = payload.y;

      if (px === undefined || py === undefined) {
        const targetMap: Record<string, { x: number; y: number }> = {
          title: { x: 50, y: 18 },
          header: { x: 50, y: 18 },
          headline: { x: 50, y: 18 },
          equation: { x: 50, y: 35 },
          step_1: { x: 50, y: 48 },
          step_2: { x: 50, y: 62 },
          step_3: { x: 50, y: 75 },
          option_1: { x: 30, y: 45 },
          option_a: { x: 30, y: 45 },
          option_2: { x: 70, y: 45 },
          option_b: { x: 70, y: 45 },
          option_3: { x: 30, y: 68 },
          option_c: { x: 30, y: 68 },
          option_4: { x: 70, y: 68 },
          option_d: { x: 70, y: 68 },
          number_line: { x: 50, y: 50 },
          objects: { x: 50, y: 45 },
          group_1: { x: 30, y: 45 },
          group_2: { x: 70, y: 45 },
          image: { x: 50, y: 50 },
          diagram: { x: 50, y: 50 },
          flashcard: { x: 50, y: 50 },
          table: { x: 50, y: 50 },
        };
        const key = (payload.target || '').toLowerCase().trim();
        const mapped = targetMap[key] || { x: 50, y: 50 };
        px = px ?? mapped.x;
        py = py ?? mapped.y;
      }

      setPointerState({
        active: true,
        x: px,
        y: py,
        label: payload.label || (payload.target ? `Ms. Priya pointing at ${payload.target}` : 'Ms. Priya points here'),
        pointerType: payload.pointerType || 'hand',
        color: payload.color || '#FF6321',
        target: payload.target,
      });
    } else if (toolEvent?.type === 'highlight_item') {
      triggerHaptic('medium');
      const payload = toolEvent.payload;
      setPointerState({
        active: true,
        x: 50,
        y: 50,
        label: `Focusing on ${payload.itemId}`,
        pointerType: 'spotlight',
        color: payload.color || '#FFD700',
        target: payload.itemId,
      });
    } else if (toolEvent) {
      triggerHaptic('medium');
    }
  }, [toolEvent]);

  // Observe size changes and resize canvas smoothly
  useEffect(() => {
    updateSize();

    const container = canvasContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);
    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [updateSize]);

  // Keyboard shortcuts for undo, redo, and quick-exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDrawingMode) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        setIsDrawingMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawingMode, handleUndo, handleRedo]);

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>): AnnotationPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const { width, height } = dimensionsRef.current;
    const scaleX = rect.width > 0 ? width / rect.width : 1;
    const scaleY = rect.height > 0 ? height / rect.height : 1;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || activeTool === 'interact') return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    const pos = getPointerPos(e);
    isDrawingRef.current = true;

    if (activeTool === 'stamp') {
      triggerHaptic('success');
      soundEffects.playPop();
      const newStroke: AnnotationStroke = {
        id: `stamp-${Date.now()}-${Math.random()}`,
        tool: 'stamp',
        points: [pos],
        color: penColor,
        width: penWidth,
        opacity: 1,
        stamp: selectedSticker,
      };
      const updated = [...strokes, newStroke];
      setStrokes(updated);
      strokesRef.current = updated;
      setRedoStack([]);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) renderStrokeOnContext(ctx, newStroke);
      }
      isDrawingRef.current = false;
      return;
    }

    triggerHaptic('light');
    const newStroke: AnnotationStroke = {
      id: `stroke-${Date.now()}-${Math.random()}`,
      tool: activeTool,
      points: [pos],
      color: penColor,
      width: penWidth,
      opacity: activeTool === 'highlighter' ? 0.45 : 1,
    };
    currentStrokeRef.current = newStroke;

    // Draw single dot immediately for fast visual feedback
    const canvas = canvasRef.current;
    if (canvas && (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'eraser')) {
      const ctx = canvas.getContext('2d');
      if (ctx) renderStrokeOnContext(ctx, newStroke);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const pos = getPointerPos(e);
    const stroke = currentStrokeRef.current;
    stroke.points.push(pos);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (stroke.tool === 'circle' || stroke.tool === 'rectangle' || stroke.tool === 'arrow') {
      // For shapes, redraw base strokes + current preview
      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);
      for (const s of strokesRef.current) {
        renderStrokeOnContext(ctx, s);
      }
      renderStrokeOnContext(ctx, stroke);
    } else {
      // For freehand pen / highlighter / eraser, render the new curve segment directly
      const pts = stroke.points;
      if (pts.length >= 3) {
        const p1 = pts[pts.length - 2];
        const p2 = pts[pts.length - 1];
        const xc = (p1.x + p2.x) / 2;
        const yc = (p1.y + p2.y) / 2;
        const p0 = pts[pts.length - 3];
        const xcPrev = (p0.x + p1.x) / 2;
        const ycPrev = (p0.y + p1.y) / 2;

        ctx.save();
        if (stroke.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = stroke.width * 4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else if (stroke.tool === 'highlighter') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.lineWidth = stroke.width * 3.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = hexToRgba(stroke.color, 0.42);
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.lineWidth = stroke.width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = stroke.color;
        }
        ctx.beginPath();
        ctx.moveTo(xcPrev, ycPrev);
        ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }

    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      const finalized = currentStrokeRef.current;
      const updated = [...strokes, finalized];
      setStrokes(updated);
      strokesRef.current = updated;
      setRedoStack([]);
      currentStrokeRef.current = null;
      redrawAllStrokes(updated);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    currentStrokeRef.current = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }
    redrawAllStrokes();
  };

  return (
    <div
      id="digital-whiteboard-container"
      className="relative flex flex-col h-full w-full bg-[#FAFAFA] border-4 border-[#F5F5F0] rounded-[32px] shadow-xs overflow-hidden p-4 md:p-6"
    >
      {/* Whiteboard Header Bar */}
      <div
        id="whiteboard-header"
        className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-gray-200/60 text-[#333333] gap-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
            Digital Interactive Whiteboard
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#5A5A40] bg-[#E8F3EF] px-2 py-0.5 rounded-full" title="Tactile Haptic Feedback Active for Touch Devices">
            <Vibrate className="w-3 h-3 text-[#FF6321]" /> Haptics
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Teacher Visual Pointer Toggle & Preset Menu */}
          <div className="relative">
            <button
              id="teacher-visual-pointer-btn"
              onClick={() => {
                triggerHaptic('medium');
                setIsPointerMenuOpen(!isPointerMenuOpen);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs border ${
                pointerState?.active
                  ? 'bg-amber-500 text-white border-amber-400 ring-2 ring-amber-200'
                  : 'bg-white hover:bg-gray-50 text-[#333333] border-gray-200'
              }`}
              title="Teacher Visual Pointer & Highlight Tool"
            >
              <Hand className="w-3.5 h-3.5 text-amber-500 fill-amber-200" />
              <span>{pointerState?.active ? 'Pointer Active' : 'Teacher Pointer'}</span>
              {pointerState?.active && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              )}
            </button>

            {/* Pointer Quick Menu Dropdown */}
            <AnimatePresence>
              {isPointerMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3.5 z-50 flex flex-col gap-2.5 text-[#333333]"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                      <Hand className="w-4 h-4 text-amber-500" /> Ms. Priya's Visual Pointer
                    </span>
                    <button
                      onClick={() => setIsPointerMenuOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-snug">
                    Highlight specific board elements for students during explanations:
                  </p>

                  {/* Pointer Style Selectors */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { type: 'hand', label: '👉 Hand', icon: '👉' },
                      { type: 'laser', label: '🔴 Laser', icon: '🔴' },
                      { type: 'magic_wand', label: '✨ Wand', icon: '✨' },
                      { type: 'spotlight', label: '🎯 Spotlight', icon: '🎯' },
                    ].map((style) => (
                      <button
                        key={style.type}
                        onClick={() => {
                          triggerHaptic('light');
                          setPointerState((prev) => ({
                            active: true,
                            x: prev?.x ?? 50,
                            y: prev?.y ?? 50,
                            label: prev?.label || 'Ms. Priya points here 👇',
                            pointerType: style.type as any,
                            color: prev?.color,
                          }));
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          pointerState?.pointerType === style.type && pointerState.active
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold shadow-xs'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <span>{style.icon}</span>
                        <span className="truncate">{style.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Quick Target Presets */}
                  <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-2">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      Point at Specific Board Elements:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { target: 'title', label: '📌 Title', x: 50, y: 18 },
                        { target: 'step_1', label: '🔢 Step 1', x: 50, y: 48 },
                        { target: 'option_1', label: '🅰️ Option A', x: 30, y: 45 },
                        { target: 'option_2', label: '🅱️ Option B', x: 70, y: 45 },
                        { target: 'center', label: '🎯 Center', x: 50, y: 50 },
                        { target: 'bottom', label: '👇 Bottom', x: 50, y: 75 },
                      ].map((preset) => (
                        <button
                          key={preset.target}
                          onClick={() => {
                            triggerHaptic('medium');
                            setPointerState({
                              active: true,
                              x: preset.x,
                              y: preset.y,
                              label: `Ms. Priya pointing at ${preset.label}`,
                              pointerType: pointerState?.pointerType || 'hand',
                            });
                            setIsPointerMenuOpen(false);
                          }}
                          className="px-2.5 py-1.5 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-medium rounded-xl border border-amber-200/80 text-left truncate cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <span className="truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Pointer */}
                  {pointerState?.active && (
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setPointerState(null);
                        setIsPointerMenuOpen(false);
                      }}
                      className="mt-1 w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Turn Off Visual Pointer
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Image Generator Button */}
          <button
            id="ai-image-generator-btn"
            onClick={() => {
              triggerHaptic('medium');
              setIsAiImageModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full transition-all cursor-pointer shadow-xs border border-purple-400"
            title="Generate Custom Educational AI Image for Whiteboard using Gemini Imagen Model"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>AI Image</span>
          </button>

          {/* Draw Mode Toggle */}
          <button
            id="toggle-draw-mode-btn"
            onClick={() => {
              triggerHaptic('medium');
              setIsDrawingMode(!isDrawingMode);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs border ${
              isDrawingMode
                ? 'bg-[#FF6321] text-white border-[#FF6321] ring-2 ring-orange-200'
                : 'bg-white hover:bg-gray-50 text-[#333333] border-gray-200'
            }`}
            title={isDrawingMode ? 'Exit Annotation Mode' : 'Freehand Draw & Annotate on Board'}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isDrawingMode ? 'Drawing Active' : 'Annotate'}</span>
            {strokes.length > 0 && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isDrawingMode ? 'bg-white text-[#FF6321]' : 'bg-orange-100 text-[#FF6321]'
                }`}
              >
                {strokes.length}
              </span>
            )}
          </button>

          <button
            id="clear-whiteboard-btn"
            onClick={handleFullClear}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white hover:bg-gray-50 border border-gray-200 text-[#333333] rounded-full transition-colors cursor-pointer shadow-xs"
            title="Clear Board & Drawings"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            Clear Board
          </button>
        </div>
      </div>

      {/* Modern Freehand Annotation Toolbar */}
      <AnimatePresence>
        {isDrawingMode && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            className="flex flex-col bg-white border border-gray-200 rounded-2xl p-2.5 mb-2 shadow-sm gap-2 z-30"
          >
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Tool Mode Selector */}
              <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-xl">
                {/* Pen */}
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    setActiveTool('pen');
                    setShowShapeMenu(false);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTool === 'pen'
                      ? 'bg-[#5A5A40] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Freehand Pen (Draw, sketch, write)"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Pen</span>
                </button>

                {/* Highlighter */}
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    setActiveTool('highlighter');
                    setShowShapeMenu(false);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTool === 'highlighter'
                      ? 'bg-[#FF6321] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Highlighter (Translucent ink over board content)"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Highlight</span>
                </button>

                {/* Shapes Dropdown / Sub-Selector */}
                <div className="relative">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setShowShapeMenu(!showShapeMenu);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTool === 'arrow' || activeTool === 'circle' || activeTool === 'rectangle'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Shapes (Arrow, Circle, Box)"
                  >
                    {activeTool === 'arrow' ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : activeTool === 'circle' ? (
                      <Circle className="w-3.5 h-3.5" />
                    ) : activeTool === 'rectangle' ? (
                      <Square className="w-3.5 h-3.5" />
                    ) : (
                      <Shapes className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {activeTool === 'arrow'
                        ? 'Arrow'
                        : activeTool === 'circle'
                        ? 'Circle'
                        : activeTool === 'rectangle'
                        ? 'Box'
                        : 'Shapes'}
                    </span>
                    <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>

                  <AnimatePresence>
                    {showShapeMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute left-0 top-full mt-1.5 w-36 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-50 flex flex-col gap-1"
                      >
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            setActiveTool('arrow');
                            setShowShapeMenu(false);
                          }}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            activeTool === 'arrow'
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <ArrowUpRight className="w-4 h-4 text-blue-600" />
                          <span>Arrow</span>
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            setActiveTool('circle');
                            setShowShapeMenu(false);
                          }}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            activeTool === 'circle'
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Circle className="w-4 h-4 text-blue-600" />
                          <span>Circle</span>
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            setActiveTool('rectangle');
                            setShowShapeMenu(false);
                          }}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            activeTool === 'rectangle'
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Square className="w-4 h-4 text-blue-600" />
                          <span>Rectangle</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Stickers / Stamps */}
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    setActiveTool('stamp');
                    setShowShapeMenu(false);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTool === 'stamp'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Stickers & Stamps"
                >
                  <Sticker className="w-3.5 h-3.5" />
                  <span>Stickers</span>
                </button>

                {/* Eraser */}
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    setActiveTool('eraser');
                    setShowShapeMenu(false);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTool === 'eraser'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Eraser (Erase strokes & markings)"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Eraser</span>
                </button>

                {/* Interact Mode */}
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTool('interact');
                    setShowShapeMenu(false);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTool === 'interact'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Interact / Click Mode (Tap cards & quiz choices underneath)"
                >
                  <MousePointer2 className="w-3.5 h-3.5" />
                  <span>Interact</span>
                </button>
              </div>

              {/* Undo & Redo Controls */}
              <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-xl">
                <button
                  onClick={handleUndo}
                  disabled={strokes.length === 0}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    strokes.length > 0
                      ? 'text-gray-700 hover:bg-white hover:shadow-xs'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    redoStack.length > 0
                      ? 'text-gray-700 hover:bg-white hover:shadow-xs'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Actions: Save, Clear Annotations, Done */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={handleDownloadSnapshot}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                  title="Download / Save Whiteboard Drawing as PNG"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span className="hidden sm:inline">Save</span>
                </button>

                <button
                  onClick={clearDrawing}
                  disabled={strokes.length === 0}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border rounded-lg transition-colors cursor-pointer ${
                    strokes.length > 0
                      ? 'bg-white hover:bg-red-50 text-red-600 border-gray-200 shadow-2xs'
                      : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                  }`}
                  title="Clear all drawings and annotations (leaves lesson content intact)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear Doodles</span>
                </button>

                <button
                  onClick={() => setIsDrawingMode(false)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#5A5A40] hover:bg-[#464632] text-white rounded-lg cursor-pointer transition-colors shadow-2xs"
                  title="Exit Annotation Mode"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            </div>

            {/* Colors, Sizes & Stickers Sub-Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
              {/* Colors */}
              {activeTool !== 'stamp' && activeTool !== 'interact' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Color:</span>
                  <div className="flex items-center gap-1.5">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          triggerHaptic('light');
                          setPenColor(c.value);
                        }}
                        className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                          penColor === c.value
                            ? 'ring-2 ring-offset-1 ring-[#5A5A40] scale-115'
                            : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stickers Palette */}
              {activeTool === 'stamp' && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stamp:</span>
                  {STICKERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedSticker(s);
                      }}
                      className={`w-7 h-7 flex items-center justify-center text-base rounded-lg border cursor-pointer transition-transform ${
                        selectedSticker === s
                          ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400 scale-110'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Size Selector */}
              {activeTool !== 'interact' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stroke:</span>
                  <div className="flex items-center gap-1">
                    {SIZES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => {
                          triggerHaptic('light');
                          setPenWidth(s.value);
                        }}
                        className={`px-2 py-0.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          penWidth === s.value
                            ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interact mode tip */}
              {activeTool === 'interact' && (
                <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 py-0.5">
                  <MousePointer2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tap cards, buttons, or quiz answers underneath. Switch to Pen/Highlighter to draw.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Whiteboard Board Canvas & Drawing Layer */}
      <div
        id="whiteboard-canvas-area"
        ref={canvasContainerRef}
        className="relative flex-1 p-4 md:p-6 flex items-center justify-center overflow-auto bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px] opacity-95"
      >
        {/* Floating Quick Doodle Toggle Button on Whiteboard Canvas */}
        {!isDrawingMode && (
          <button
            onClick={() => {
              triggerHaptic('medium');
              setIsDrawingMode(true);
            }}
            className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6321] text-white text-xs font-bold rounded-full shadow-md hover:bg-[#e0551c] transition-all cursor-pointer hover:scale-105"
            title="Open Freehand Drawing & Annotations on Whiteboard"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Draw / Annotate</span>
          </button>
        )}

        {/* HTML5 Free Drawing Canvas Overlay */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className={`absolute inset-0 w-full h-full z-10 touch-none ${
            isDrawingMode
              ? activeTool === 'interact'
                ? 'cursor-default pointer-events-none'
                : activeTool === 'stamp'
                  ? 'cursor-pointer pointer-events-auto'
                  : 'cursor-crosshair pointer-events-auto'
              : 'pointer-events-none'
          }`}
        />

        <div className="relative z-0 w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!toolEvent ? (
              <motion.div
                key="empty-board"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200/80 rounded-3xl bg-white/95 max-w-md shadow-xs backdrop-blur-xs"
              >
                <div className="p-4 rounded-full bg-[#E8F3EF] text-[#5A5A40] mb-3">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#333333] mb-1">Whiteboard Ready</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Ms. Priya will draw visual objects, number lines, equations, and story cards here during our class! You can also click <span className="font-bold text-[#FF6321]">Annotate</span> to draw freely.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={JSON.stringify(toolEvent)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-2xl bg-white/95 backdrop-blur-xs rounded-3xl p-2 shadow-xs"
              >
                {/* TOOL: SHOW_OBJECTS */}
                {toolEvent.type === 'show_objects' && (
                  <div className="flex flex-col items-center p-6">
                    {toolEvent.payload.label && (
                      <h3 className="text-xl font-bold text-[#333333] mb-4 text-center">
                        {toolEvent.payload.label}
                      </h3>
                    )}

                    {/* Visual Groups or Grid */}
                    {toolEvent.payload.group1 && toolEvent.payload.group2 ? (
                      <div className="flex flex-wrap items-center justify-center gap-6 my-2">
                        {/* Group 1 */}
                        <div className="flex flex-col items-center p-4 bg-[#F3F7F5] border border-gray-200 rounded-2xl">
                          <span className="text-xs font-bold text-[#5A5A40] mb-2">
                            Group A ({toolEvent.payload.group1})
                          </span>
                          <div className="flex flex-wrap justify-center gap-2 max-w-[200px]">
                            {Array.from({ length: toolEvent.payload.group1 }).map((_, i) => (
                              <motion.span
                                key={`g1-${i}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.08 }}
                                className="text-3xl filter drop-shadow-xs"
                              >
                                {OBJECT_EMOJIS[toolEvent.payload.object]?.emoji || '🍎'}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        {/* Operation Symbol */}
                        <div className="text-3xl font-extrabold text-[#5A5A40]">
                          {toolEvent.payload.symbol || '+'}
                        </div>

                        {/* Group 2 */}
                        <div className="flex flex-col items-center p-4 bg-[#F3F7F5] border border-gray-200 rounded-2xl">
                          <span className="text-xs font-bold text-[#5A5A40] mb-2">
                            Group B ({toolEvent.payload.group2})
                          </span>
                          <div className="flex flex-wrap justify-center gap-2 max-w-[200px]">
                            {Array.from({ length: toolEvent.payload.group2 }).map((_, i) => (
                              <motion.span
                                key={`g2-${i}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: (toolEvent.payload.group1! + i) * 0.08 }}
                                className="text-3xl filter drop-shadow-xs"
                              >
                                {OBJECT_EMOJIS[toolEvent.payload.object]?.emoji || '🍎'}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-3 my-4 max-w-lg">
                        {Array.from({ length: toolEvent.payload.count }).map((_, i) => (
                          <motion.div
                            key={`obj-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex flex-col items-center justify-center p-3 bg-[#F3F7F5] rounded-2xl border border-gray-200 min-w-[60px]"
                          >
                            <span className="text-4xl">
                              {OBJECT_EMOJIS[toolEvent.payload.object]?.emoji || '🍎'}
                            </span>
                            <span className="text-xs text-gray-500 font-mono mt-1">#{i + 1}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 px-5 py-2 rounded-full bg-[#FF6321] text-white text-sm font-bold shadow-xs">
                      Total Count = {toolEvent.payload.count} {toolEvent.payload.object}s
                    </div>
                  </div>
                )}

                {/* TOOL: DRAW_NUMBER_LINE */}
                {toolEvent.type === 'draw_number_line' && (
                  <div className="flex flex-col items-center p-6 w-full">
                    <h3 className="text-lg font-bold text-[#333333] mb-6">
                      {toolEvent.payload.label || 'Number Line'}
                    </h3>

                    <div className="relative w-full py-8 px-4 flex items-center justify-between">
                      {/* Horizontal Line */}
                      <div className="absolute left-4 right-4 h-2 bg-[#5A5A40] rounded-full" />

                      {Array.from({
                        length: toolEvent.payload.max - toolEvent.payload.min + 1,
                      }).map((_, idx) => {
                        const num = toolEvent.payload.min + idx;
                        const isHighlighted = toolEvent.payload.highlightNumber === num;

                        return (
                          <div key={`nl-${num}`} className="relative flex flex-col items-center z-10">
                            {isHighlighted && (
                              <motion.div
                                initial={{ y: -10 }}
                                animate={{ y: 0 }}
                                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.6 }}
                                className="absolute -top-10 flex flex-col items-center text-[#FF6321]"
                              >
                                <span className="text-xs font-bold bg-[#FF6321] text-white px-2 py-0.5 rounded-full shadow-xs">
                                  Here!
                                </span>
                                <span className="text-sm text-[#FF6321]">▼</span>
                              </motion.div>
                            )}

                            <div
                              className={`w-3.5 h-5 rounded-full transition-colors ${
                                isHighlighted ? 'bg-[#FF6321] h-7' : 'bg-[#5A5A40]'
                              }`}
                            />
                            <span
                              className={`mt-2 font-mono text-sm font-bold ${
                                isHighlighted ? 'text-[#FF6321] text-base scale-110' : 'text-[#333333]'
                              }`}
                            >
                              {num}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TOOL: SHOW_EQUATION */}
                {toolEvent.type === 'show_equation' && (
                  <div className="flex flex-col items-center p-6">
                    <span className="text-xs font-semibold uppercase text-[#5A5A40] tracking-wider mb-2">
                      Math Equation
                    </span>
                    <div className="text-4xl md:text-5xl font-extrabold text-[#5A5A40] font-mono tracking-widest my-4 px-8 py-4 bg-[#F3F7F5] rounded-2xl border border-gray-200 shadow-inner">
                      {toolEvent.payload.equation}
                    </div>

                    {toolEvent.payload.steps && toolEvent.payload.steps.length > 0 && (
                      <div className="w-full mt-4 space-y-2">
                        {toolEvent.payload.steps.map((step, idx) => (
                          <div
                            key={`step-${idx}`}
                            className="flex items-center gap-3 p-3 bg-[#F3F7F5] rounded-xl border border-gray-200 text-sm text-[#333333]"
                          >
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#5A5A40] text-white text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TOOL: SHOW_TEXT */}
                {toolEvent.type === 'show_text' && (
                  <div className="p-6">
                    {toolEvent.payload.title && (
                      <h3 className="text-lg font-bold text-[#333333] border-b border-gray-100 pb-2 mb-4">
                        {toolEvent.payload.title}
                      </h3>
                    )}
                    <p className="text-xl md:text-2xl font-medium text-[#333333] leading-relaxed">
                      {toolEvent.payload.text}
                    </p>

                    {toolEvent.payload.highlight && (
                      <div className="mt-4 inline-block px-3.5 py-1 bg-[#E8F3EF] text-[#5A5A40] text-sm font-semibold rounded-lg border border-[#C8DCD1]">
                        💡 Focus Concept: {toolEvent.payload.highlight}
                      </div>
                    )}
                  </div>
                )}

                {/* TOOL: SHOW_IMAGE */}
                {toolEvent.type === 'show_image' && (
                  <div className="flex flex-col items-center p-6 w-full">
                    {/* Active Imagen Generated AI Image */}
                    {(activeBoardImageUrl || toolEvent.payload.url) ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="relative group rounded-3xl overflow-hidden border-2 border-purple-200 shadow-md bg-white p-2 w-full max-w-lg">
                          <img
                            src={activeBoardImageUrl || toolEvent.payload.url}
                            alt={activeBoardImageCaption || toolEvent.payload.caption || 'Gemini Imagen Whiteboard Illustration'}
                            referrerPolicy="no-referrer"
                            className="w-full h-auto max-h-[380px] object-contain rounded-2xl bg-gray-50"
                          />
                          <div className="absolute top-4 right-4 bg-purple-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-300" /> Gemini Imagen AI
                          </div>
                        </div>

                        {(activeBoardImageCaption || toolEvent.payload.caption) && (
                          <p className="text-sm font-semibold text-[#333333] mt-3 text-center bg-purple-50 px-4 py-1.5 rounded-full border border-purple-200">
                            ✨ {activeBoardImageCaption || toolEvent.payload.caption}
                          </p>
                        )}

                        <button
                          onClick={() => setIsAiImageModalOpen(true)}
                          className="mt-3 text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-white hover:bg-purple-50 px-3 py-1 rounded-full border border-purple-200 transition-colors cursor-pointer"
                        >
                          <Wand2 className="w-3.5 h-3.5" /> Generate another AI image with Imagen
                        </button>
                      </div>
                    ) : isGeneratingAiImage ? (
                      <div className="p-8 rounded-3xl bg-purple-50/70 border border-purple-200 flex flex-col items-center justify-center text-center my-3 w-full">
                        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
                        <h4 className="text-base font-bold text-purple-900">Gemini Imagen AI is Drawing...</h4>
                        <p className="text-xs text-purple-700 mt-1">Generating custom educational visual for {toolEvent.payload.prompt || 'your whiteboard'}</p>
                      </div>
                    ) : (
                      /* Preset graphics fallback + button to generate Imagen picture */
                      <div className="p-6 rounded-2xl bg-[#F3F7F5] border border-gray-200 flex flex-col items-center justify-center text-center my-3 w-full">
                        {toolEvent.payload.preset === 'fractions' && (
                          <div className="flex items-center gap-4 text-[#5A5A40]">
                            <PieChart className="w-20 h-20" />
                            <div className="text-left">
                              <p className="text-lg font-bold">Fractions Visual</p>
                              <p className="text-xs text-gray-500">1 Whole = 1/2 + 1/2</p>
                            </div>
                          </div>
                        )}
                        {toolEvent.payload.preset === 'shapes' && (
                          <div className="flex items-center gap-4 text-[#5A5A40]">
                            <Shapes className="w-20 h-20" />
                            <div className="text-left">
                              <p className="text-lg font-bold">Geometric Shapes</p>
                              <p className="text-xs text-gray-500">Triangle, Circle, Square</p>
                            </div>
                          </div>
                        )}
                        {toolEvent.payload.preset === 'clock' && (
                          <div className="flex items-center gap-4 text-[#FF6321]">
                            <Clock className="w-20 h-20" />
                            <div className="text-left">
                              <p className="text-lg font-bold">Telling Time</p>
                              <p className="text-xs text-gray-500">Hour & Minute Hands</p>
                            </div>
                          </div>
                        )}
                        {toolEvent.payload.preset === 'solar_system' && (
                          <div className="flex items-center gap-4 text-[#5A5A40]">
                            <Sun className="w-20 h-20 animate-spin" />
                            <div className="text-left">
                              <p className="text-lg font-bold">Our Solar System</p>
                              <p className="text-xs text-gray-500">Sun & Planets Orbit</p>
                            </div>
                          </div>
                        )}
                        {toolEvent.payload.preset === 'plant' && (
                          <div className="flex items-center gap-4 text-[#5A5A40]">
                            <Sprout className="w-20 h-20" />
                            <div className="text-left">
                              <p className="text-lg font-bold">Parts of a Plant</p>
                              <p className="text-xs text-gray-500">Roots, Stem, Leaves</p>
                            </div>
                          </div>
                        )}
                        {toolEvent.payload.preset === 'coins' && (
                          <div className="flex items-center gap-4 text-[#FF6321]">
                            <Coins className="w-20 h-20" />
                            <div className="text-left">
                              <p className="text-lg font-bold">Indian Currency & Coins</p>
                              <p className="text-xs text-gray-500">Counting Rupees</p>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            const presetPrompts: Record<string, string> = {
                              fractions: 'Delicious pizza cut into equal fraction slices',
                              shapes: 'Colorful geometric shapes collage triangle circle square',
                              clock: 'Clock face showing 3 o clock with hour and minute hands',
                              solar_system: 'Solar system with sun and colorful planets in space',
                              plant: 'Parts of a plant with green leaves roots stem flower',
                              coins: 'Indian rupees coins ten rupees and twenty rupees',
                            };
                            const promptToUse = presetPrompts[toolEvent.payload.preset || ''] || 'Educational illustration';
                            setAiPrompt(promptToUse);
                            handleGenerateAiImage(promptToUse);
                          }}
                          className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                          <span>Generate HD Imagen AI Picture for this Lesson</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TOOL: SHOW_DIAGRAM */}
                {toolEvent.type === 'show_diagram' && (
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#333333] mb-4 text-center">
                      {toolEvent.payload.title}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-4 py-4">
                      {toolEvent.payload.nodes.map((node, i) => (
                        <div
                          key={node.id}
                          className="flex flex-col items-center p-4 bg-[#E8F3EF] border border-[#C8DCD1] rounded-2xl shadow-xs min-w-[120px]"
                        >
                          <span className="text-xs font-mono font-bold text-[#5A5A40]">Node #{i + 1}</span>
                          <span className="text-sm font-bold text-[#333333] mt-1 text-center">{node.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TOOL: SHOW_TIMELINE */}
                {toolEvent.type === 'show_timeline' && (
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#333333] mb-6 text-center">
                      {toolEvent.payload.title}
                    </h3>
                    <div className="space-y-4 max-w-lg mx-auto">
                      {toolEvent.payload.events.map((ev, i) => (
                        <div key={i} className="flex gap-4 items-start p-3 bg-[#F3F7F5] rounded-2xl border border-gray-200">
                          <span className="px-3 py-1 bg-[#5A5A40] text-white text-xs font-bold font-mono rounded-xl shrink-0">
                            {ev.date}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-[#333333]">{ev.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{ev.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TOOL: SHOW_TABLE */}
                {toolEvent.type === 'show_table' && (
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#333333] mb-4 text-center">
                      {toolEvent.payload.title}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse bg-white rounded-2xl overflow-hidden border border-gray-200">
                        <thead>
                          <tr className="bg-[#F3F7F5] border-b border-gray-200 text-xs font-bold text-[#5A5A40]">
                            {toolEvent.payload.headers.map((h, i) => (
                              <th key={i} className="p-3">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-[#333333]">
                          {toolEvent.payload.rows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-gray-50">
                              {row.map((cell, ci) => (
                                <td key={ci} className="p-3 font-medium">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TOOL: SHOW_FLASHCARDS */}
                {toolEvent.type === 'show_flashcards' && (
                  <div className="p-6 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-[#5A5A40] mb-4">
                      {toolEvent.payload.title}
                    </h3>
                    <div className="w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-[#E8F3EF] to-[#F3F7F5] border border-[#C8DCD1] shadow-md flex flex-col items-center text-center">
                      <span className="text-xs font-bold uppercase text-[#5A5A40] tracking-wider mb-2">
                        🧠 Memory Flashcard
                      </span>
                      <p className="text-xl font-extrabold text-[#333333] mb-6">
                        {toolEvent.payload.front}
                      </p>
                      <div className="p-4 rounded-2xl bg-white/90 border border-gray-200 w-full mb-4">
                        <span className="text-xs font-bold text-[#FF6321] block mb-1">Answer / Definition:</span>
                        <p className="text-base font-bold text-[#333333]">{toolEvent.payload.back}</p>
                      </div>
                      {toolEvent.payload.hint && (
                        <p className="text-xs text-gray-500 italic">
                          💡 Hint: {toolEvent.payload.hint}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* TOOL: SHOW_MULTIPLE_CHOICE */}
                {toolEvent.type === 'show_multiple_choice' && (
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-[#5A5A40] text-xs font-bold uppercase tracking-wider mb-2">
                      <HelpCircle className="w-4 h-4" />
                      Interactive Practice Question
                    </div>
                    <h3 className="text-xl font-bold text-[#333333] mb-6">
                      {toolEvent.payload.question}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {toolEvent.payload.options.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = toolEvent.payload.answerIndex === idx;

                        return (
                          <button
                            key={`opt-${idx}`}
                            onClick={() => {
                              triggerHaptic(isCorrect ? 'success' : 'error');
                              setSelectedOption(idx);
                              if (onAnswerSubmit) {
                                onAnswerSubmit(idx, isCorrect);
                              }
                            }}
                            className={`flex items-center justify-between p-4 rounded-2xl border text-left font-medium transition-all cursor-pointer ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-[#E8F3EF] border-[#5A5A40] text-[#5A5A40]'
                                  : 'bg-red-50 border-red-300 text-red-800'
                                : 'bg-white border-gray-200 hover:bg-[#F3F7F5] text-[#333333]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#F3F7F5] text-[#5A5A40] text-xs font-mono font-bold">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="text-base">{option}</span>
                            </div>

                            {isSelected && (
                              <span>
                                {isCorrect ? (
                                  <CheckCircle2 className="w-5 h-5 text-[#5A5A40]" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                )}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TOOL: CHECK_ANSWER */}
                {toolEvent.type === 'check_answer' && (
                  <div
                    className={`p-6 rounded-3xl border shadow-xs flex items-center gap-4 ${
                      toolEvent.payload.isCorrect
                        ? 'bg-[#E8F3EF] border-[#C8DCD1] text-[#5A5A40]'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="p-3 rounded-2xl bg-white shadow-xs">
                      {toolEvent.payload.isCorrect ? (
                        <CheckCircle2 className="w-8 h-8 text-[#5A5A40]" />
                      ) : (
                        <HelpCircle className="w-8 h-8 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">
                        {toolEvent.payload.isCorrect ? 'Super Job!' : 'Let’s Try Again Together!'}
                      </h4>
                      <p className="text-sm opacity-90">{toolEvent.payload.feedback}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Teacher Visual Pointer Overlay */}
        <AnimatePresence>
          {pointerState && pointerState.active && (
            <motion.div
              key={`pointer-${pointerState.x}-${pointerState.y}-${pointerState.label}`}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.2, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="absolute z-30 pointer-events-none transition-all duration-300 ease-out flex flex-col items-center"
              style={{
                left: `${pointerState.x}%`,
                top: `${pointerState.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Pointer Graphic */}
              {pointerState.pointerType === 'laser' && (
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 rounded-full bg-red-500/40 animate-ping" />
                  <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-red-500/60 animate-spin" />
                  <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-xl shadow-red-500/80 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  </div>
                </div>
              )}

              {pointerState.pointerType === 'hand' && (
                <div className="relative flex flex-col items-center">
                  <div className="absolute -inset-3 rounded-full bg-amber-400/40 animate-ping" />
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [-8, 0, -8] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    className="text-4xl filter drop-shadow-xl select-none"
                  >
                    👉
                  </motion.div>
                </div>
              )}

              {pointerState.pointerType === 'magic_wand' && (
                <div className="relative flex flex-col items-center">
                  <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-amber-300 via-purple-300 to-pink-300 opacity-70 animate-pulse blur-xs" />
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="text-4xl filter drop-shadow-lg select-none"
                  >
                    ✨🪄
                  </motion.div>
                </div>
              )}

              {pointerState.pointerType === 'spotlight' && (
                <div className="relative flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-amber-400 bg-amber-400/15 shadow-[0_0_60px_rgba(251,191,36,0.9)] animate-pulse flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-500 animate-spin" />
                  </div>
                  <div className="absolute text-2xl select-none">🎯</div>
                </div>
              )}

              {/* Speech / Tooltip Bubble */}
              {pointerState.label && (
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mt-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-2xl border border-amber-400/60 backdrop-blur-md flex items-center gap-2 whitespace-nowrap pointer-events-auto"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-amber-300 font-extrabold text-[11px] uppercase tracking-wider">
                    Ms. Priya:
                  </span>
                  <span className="text-gray-100">{pointerState.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPointerState(null);
                    }}
                    className="ml-1 p-0.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer transition-colors"
                    title="Dismiss Pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gemini Imagen AI Image Generator Modal */}
      <AnimatePresence>
        {isAiImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-purple-100 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#333333]">
                      Gemini Imagen AI Artist
                    </h3>
                    <p className="text-xs text-gray-500">Generate custom whiteboard illustrations</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiImageModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preset Chips */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-2 block uppercase tracking-wider">
                  💡 Quick Educational Suggestions:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🪐 Solar System', prompt: 'Colorful solar system showing sun and orbiting planets with stars' },
                    { label: '🪴 Plant Diagram', prompt: 'Elementary science diagram of a green potted plant with roots, stem, and leaves' },
                    { label: '🍕 Fractions Pizza', prompt: 'Delicious pizza cut into 4 equal fraction slices showing 1/4' },
                    { label: '🪙 Indian Coins', prompt: 'Bright ₹10 coin and ₹20 coin placed side by side' },
                    { label: '🐪 Camel in Desert', prompt: 'Cute cartoon camel walking high in the desert dunes for Hindi story' },
                    { label: '⚽ Football Bear', prompt: 'Friendly cartoon brown bear kicking a soccer ball on grass' },
                    { label: '💧 Water Cycle', prompt: 'Simple water cycle with sun, clouds, rain, and river' },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => {
                        setAiPrompt(chip.prompt);
                        handleGenerateAiImage(chip.prompt);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl border border-purple-200 transition-colors cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input Form */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Custom AI Image Prompt:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., A cute rabbit counting 5 orange carrots..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGenerateAiImage();
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleGenerateAiImage()}
                    disabled={isGeneratingAiImage || !aiPrompt.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    {isGeneratingAiImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    <span>{isGeneratingAiImage ? 'Generating...' : 'Generate'}</span>
                  </button>
                </div>
              </div>

              {aiImageError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  ⚠️ {aiImageError}
                </p>
              )}

              {isGeneratingAiImage && (
                <div className="flex flex-col items-center justify-center p-6 bg-purple-50/50 rounded-2xl border border-purple-100 text-center gap-2">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  <p className="text-sm font-bold text-purple-900">Gemini Imagen model is drawing...</p>
                  <p className="text-xs text-purple-600">Creating high quality Class 2 educational illustration</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

