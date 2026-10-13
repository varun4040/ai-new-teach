import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  HelpCircle,
  Eye,
  Heart,
  PartyPopper,
  Volume2,
} from 'lucide-react';
import {
  AvatarState,
  CharacterState,
  EMOTION_TO_CHARACTER_STATE,
  MotionKinematics,
} from '../types';
import { STATE_MOTION_KINEMATICS } from '../lib/MotionTeacherAdapter';
import { ThreeModelTeacherCanvas } from './ThreeModelTeacherCanvas';

export const DEFAULT_REAL_TEACHER_IMAGE =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=85';

export type TeacherVisualMode = 'real' | 'sculpted' | 'three_model';

interface InteractiveTeacherCharacterProps {
  avatarState: AvatarState;
  teacherName?: string;
  customAvatarUrl?: string;
  customModelUrl?: string;
  modelFormat?: 'glb' | 'gltf' | 'obj';
  faceStyle?: TeacherVisualMode;
  interactiveEyeTracking?: boolean;
  faceZoom?: 'normal' | 'closeup' | 'large';
  isEnlarged?: boolean;
}

export const InteractiveTeacherCharacter: React.FC<InteractiveTeacherCharacterProps> = ({
  avatarState,
  teacherName = 'Ms. Priya',
  customAvatarUrl,
  customModelUrl,
  modelFormat = 'glb',
  faceStyle = 'real',
  interactiveEyeTracking = true,
  faceZoom = 'normal',
  isEnlarged = false,
}) => {
  // 1. Resolve Effective Character State & Kinematics
  const effectiveState: CharacterState = useMemo(() => {
    if (avatarState.characterState) {
      return avatarState.characterState;
    }
    if (avatarState.isSpeaking) {
      return 'SPEAKING';
    }
    return EMOTION_TO_CHARACTER_STATE[avatarState.emotion] || 'IDLE';
  }, [avatarState.characterState, avatarState.isSpeaking, avatarState.emotion]);

  const kinematics: MotionKinematics = useMemo(() => {
    return (
      avatarState.motionKinematics ||
      STATE_MOTION_KINEMATICS[effectiveState] ||
      STATE_MOTION_KINEMATICS.IDLE
    );
  }, [avatarState.motionKinematics, effectiveState]);

  const isSpeaking = avatarState.isSpeaking || effectiveState === 'SPEAKING';
  const lookingAtBoard = avatarState.lookingAt === 'board';

  // Active portrait image URL (default to high-res realistic Indian teacher)
  const activeImageUrl = customAvatarUrl || DEFAULT_REAL_TEACHER_IMAGE;

  // 2. Interactive Cursor Position & 3D Parallax Tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseGaze, setMouseGaze] = useState<{
    x: number;
    y: number;
    yaw: number;
    pitch: number;
  }>({
    x: 0,
    y: 0,
    yaw: 0,
    pitch: 0,
  });
  const [lastMouseMove, setLastMouseMove] = useState<number>(Date.now());

  useEffect(() => {
    if (!interactiveEyeTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      setLastMouseMove(Date.now());
      if (lookingAtBoard || effectiveState === 'THINKING' || effectiveState === 'CONFUSED') {
        return;
      }

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.42;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Max pupil travel in 3D face: ±4.5px
      const maxPupilPx = 4.5;
      const factor = Math.min(1, distance / 320);
      const angle = Math.atan2(deltaY, deltaX);

      const targetX = Math.cos(angle) * maxPupilPx * factor;
      const targetY = Math.sin(angle) * (maxPupilPx * 0.75) * factor;

      // Parallax 3D head yaw and pitch
      const targetYaw = Math.max(-7, Math.min(7, (deltaX / 300) * 7));
      const targetPitch = Math.max(-4.5, Math.min(4.5, (deltaY / 300) * 4.5));

      setMouseGaze({
        x: targetX,
        y: targetY,
        yaw: targetYaw,
        pitch: targetPitch,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactiveEyeTracking, lookingAtBoard, effectiveState]);

  // 3. Autonomous Micro-Saccades (subtle gaze shifts when cursor rests)
  const [saccadeOffset, setSaccadeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    const saccadeInterval = setInterval(() => {
      const isMouseResting = Date.now() - lastMouseMove > 1800;
      if (
        isMouseResting &&
        !lookingAtBoard &&
        effectiveState !== 'THINKING' &&
        effectiveState !== 'CONFUSED'
      ) {
        setSaccadeOffset({
          x: (Math.random() - 0.5) * 2.0,
          y: (Math.random() - 0.5) * 1.4,
        });
      }
    }, 2800);

    return () => clearInterval(saccadeInterval);
  }, [lastMouseMove, lookingAtBoard, effectiveState]);

  // 4. Combined Target Eye Gaze & Head Orientation
  const currentEyeGaze = useMemo(() => {
    if (lookingAtBoard) {
      return { x: 4.2, y: -0.3 };
    }
    if (effectiveState === 'THINKING') {
      return { x: 3.5, y: -3.5 };
    }
    if (effectiveState === 'CONFUSED') {
      return { x: 2.2, y: -2.0 };
    }
    return {
      x: mouseGaze.x + saccadeOffset.x,
      y: mouseGaze.y + saccadeOffset.y,
    };
  }, [lookingAtBoard, effectiveState, mouseGaze, saccadeOffset]);

  const currentHeadOrientation = useMemo(() => {
    if (lookingAtBoard) {
      return { yaw: -12, pitch: 0, roll: -3 };
    }
    return {
      yaw: kinematics.headYaw + mouseGaze.yaw * 0.75,
      pitch: kinematics.headPitch + mouseGaze.pitch * 0.75,
      roll: kinematics.headRoll,
    };
  }, [lookingAtBoard, kinematics, mouseGaze]);

  // 5. Speaking Viseme Lip-Sync Oscillator
  const [visemeStage, setVisemeStage] = useState<number>(0);
  useEffect(() => {
    if (!isSpeaking) {
      setVisemeStage(0);
      return;
    }

    const interval = setInterval(() => {
      setVisemeStage((prev) => (prev + 1) % 4);
    }, 130);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // 6. Spring physics configuration
  const springTransition = useMemo(
    () => ({
      type: 'spring' as const,
      stiffness: kinematics.springStiffness || 140,
      damping: kinematics.springDamping || 15,
      mass: kinematics.springMass || 1.0,
    }),
    [kinematics]
  );

  return (
    <motion.div
      ref={containerRef}
      id="avatar-breathing-container"
      className={`relative flex flex-col items-center justify-end select-none w-full ${
        isEnlarged ? 'max-w-[460px] sm:max-w-[540px]' : 'max-w-[360px] sm:max-w-[420px]'
      }`}
      style={{ transformOrigin: 'center bottom', perspective: 1000 }}
      animate={{
        scaleY: [1.0, kinematics.containerScaleMax || 1.018, 1.0],
        scaleX: [1.0, 1 + ((kinematics.containerScaleMax || 1.018) - 1) * 0.35, 1.0],
        y: [0, -1.8, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: kinematics.breathingDurationSec || 3.8,
        ease: kinematics.breathingCurve || [0.45, 0.05, 0.55, 0.95],
      }}
    >
      {/* 🌟 Dynamic Reactive Aura with Framer Motion */}
      <motion.div
        animate={{
          scale:
            effectiveState === 'CELEBRATING'
              ? [1, 1.25, 1.15]
              : effectiveState === 'LISTENING'
              ? [1, 1.12, 1.05]
              : effectiveState === 'THINKING'
              ? [1, 1.08, 1.02]
              : [1, 1.04, 1],
          opacity: effectiveState === 'IDLE' ? 0.35 : 0.65,
        }}
        transition={{
          repeat: Infinity,
          duration: effectiveState === 'LISTENING' ? 2.4 : 3.6,
          ease: 'easeInOut',
        }}
        className={`absolute top-4 w-64 h-64 rounded-full pointer-events-none blur-2xl transition-colors duration-700 ${
          effectiveState === 'THINKING'
            ? 'bg-amber-400/40'
            : effectiveState === 'CONFUSED'
            ? 'bg-purple-500/35'
            : effectiveState === 'LISTENING'
            ? 'bg-emerald-500/45'
            : effectiveState === 'CELEBRATING'
            ? 'bg-amber-300/50'
            : effectiveState === 'ENCOURAGING'
            ? 'bg-teal-400/40'
            : effectiveState === 'SPEAKING'
            ? 'bg-orange-400/35'
            : 'bg-[#C8DCD1]/35'
        }`}
      />

      {/* 🏷️ Floating State Badges */}
      <AnimatePresence mode="wait">
        {effectiveState === 'THINKING' && (
          <motion.div
            key="badge-thinking"
            initial={{ opacity: 0, y: 12, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="absolute -top-10 right-2 z-30 flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-lg"
          >
            <HelpCircle className="w-3.5 h-3.5 animate-spin [animation-duration:5s]" />
            <span>Thinking...</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-0.5" />
          </motion.div>
        )}

        {effectiveState === 'CONFUSED' && (
          <motion.div
            key="badge-confused"
            initial={{ opacity: 0, y: 12, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="absolute -top-10 right-2 z-30 flex items-center gap-1.5 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold shadow-lg"
          >
            <span className="text-sm">❓</span>
            <span>Let's review!</span>
          </motion.div>
        )}

        {effectiveState === 'LISTENING' && (
          <motion.div
            key="badge-listening"
            initial={{ opacity: 0, y: 12, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 240, damping: 15 }}
            className="absolute -top-10 left-2 z-30 flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-lg"
          >
            <Eye className="w-3.5 h-3.5 animate-pulse" />
            <span>Listening</span>
            <span className="flex items-center gap-0.5 ml-1">
              <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.2s]" />
              <span className="w-1 h-3 bg-white rounded-full animate-bounce" />
              <span className="w-1 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
            </span>
          </motion.div>
        )}

        {effectiveState === 'CELEBRATING' && (
          <motion.div
            key="badge-celebrating"
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 12 }}
            className="absolute -top-12 z-30 flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-extrabold shadow-xl"
          >
            <PartyPopper className="w-4 h-4 animate-bounce" />
            <span>Fantastic Job! 🎉</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
          </motion.div>
        )}

        {effectiveState === 'ENCOURAGING' && (
          <motion.div
            key="badge-encouraging"
            initial={{ opacity: 0, y: 12, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="absolute -top-10 z-30 flex items-center gap-1.5 px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-bold shadow-lg"
          >
            <Heart className="w-3.5 h-3.5 text-rose-200 fill-rose-200" />
            <span>You can do it! 👍</span>
          </motion.div>
        )}

        {isSpeaking && (
          <motion.div
            key="badge-speaking"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 240, damping: 15 }}
            className="absolute -top-10 z-30 flex items-center gap-1.5 px-3.5 py-1 bg-[#FF6321] text-white rounded-full text-xs font-bold shadow-lg"
          >
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span>Speaking...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. 3D GLB / GLTF / OBJ IMPORTED MODEL CANVAS */}
      {faceStyle === 'three_model' ? (
        <ThreeModelTeacherCanvas
          modelUrl={customModelUrl || ''}
          modelFormat={modelFormat}
          avatarState={avatarState}
          teacherName={teacherName}
          interactiveEyeTracking={interactiveEyeTracking}
          faceZoom={faceZoom}
          isEnlarged={isEnlarged}
        />
      ) : faceStyle === 'real' ? (
        /* 👤 2. REALISTIC STUDIO PHOTOGRAPHIC TEACHER (Clean 3D Parallax & Head Kinematics) */
        <motion.div
          id="real-photorealistic-teacher-stage"
          className="relative flex flex-col items-center justify-end w-full"
          animate={{
            rotateY: currentHeadOrientation.yaw,
            rotateX: currentHeadOrientation.pitch,
            rotateZ: currentHeadOrientation.roll,
            y: kinematics.headY,
          }}
          transition={springTransition}
          style={{ transformOrigin: 'center 85%', transformStyle: 'preserve-3d' }}
        >
          {/* Main Studio Portrait Frame */}
          <div
            className={`relative ${
              isEnlarged
                ? 'w-72 h-80 sm:w-88 sm:h-96 md:w-[420px] md:h-[450px]'
                : 'w-64 h-72 sm:w-76 sm:h-84 md:w-80 md:h-[360px]'
            } max-w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-[#5A5A40] bg-stone-900 group transition-all duration-300`}
          >
            {/* Real Photographic Teacher Image (clean, unadulterated portrait with organic micro-blink dip and face framing) */}
            <motion.img
              src={activeImageUrl}
              alt={teacherName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-[center_18%] filter contrast-105 brightness-102"
              style={{ transformOrigin: 'center 22%' }}
              animate={{
                scaleY: avatarState.isBlinking
                  ? (faceZoom === 'closeup' ? 1.35 : 1.03)
                  : (faceZoom === 'closeup' ? 1.39 : 1.07),
                scaleX: faceZoom === 'closeup' ? 1.39 : 1.07,
                x: mouseGaze.x * 0.4,
                y: avatarState.isBlinking ? mouseGaze.y * 0.3 + 1.2 : mouseGaze.y * 0.3,
              }}
              transition={{
                duration: avatarState.isBlinking ? 0.08 : 0.14,
                ease: 'easeInOut',
              }}
            />

            {/* Organic Eyelid Blink Shutter for Photographic Mode */}
            <motion.div
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              animate={{
                opacity: avatarState.isBlinking ? 0.85 : 0,
              }}
              transition={{ duration: 0.08, ease: 'easeInOut' }}
            >
              <div
                className={`absolute left-[20%] right-[20%] ${
                  faceZoom === 'closeup' ? 'top-[27%] h-[14%]' : 'top-[33%] h-[12%]'
                } rounded-full bg-[#2C1810]/50 backdrop-blur-[0.5px] mix-blend-multiply transition-transform duration-75`}
                style={{
                  transform: avatarState.isBlinking ? 'scaleY(1)' : 'scaleY(0.1)',
                  transformOrigin: 'top center',
                }}
              />
            </motion.div>

            {/* Dynamic 3D Optical Glint across Eyeglasses (moves naturally with head tilt) */}
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-tr from-transparent via-white/25 to-transparent"
              style={{
                transform: `translateX(${currentHeadOrientation.yaw * 5}px) translateY(${
                  currentHeadOrientation.pitch * 3
                }px) rotate(25deg)`,
                transition: 'transform 0.15s ease-out',
              }}
            />

            {/* Speaking Audio Reactive Microphone Pulse */}
            {isSpeaking && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-orange-400/40">
                <Volume2 className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <div className="flex items-center gap-0.5 h-2.5">
                  <span className="w-0.5 h-full bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-0.5 h-full bg-orange-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-0.5 h-full bg-orange-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            {/* Natural Ambient Lighting Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

            {/* Live Indicator Tag */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-bold text-white border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Studio Live</span>
            </div>
          </div>
        </motion.div>
      ) : (
        /* 🎨 2. ANATOMICALLY DETAILED 3D ANIMATED TEACHER (Integrated Live Eye-Tracking & Visemes) */
        <motion.svg
          viewBox="0 0 240 290"
          className={`w-full h-auto ${
            isEnlarged ? 'max-h-[440px] sm:max-h-[500px]' : 'max-h-[340px] sm:max-h-[390px]'
          } drop-shadow-xl overflow-visible transition-all duration-300`}
          style={{
            transformOrigin: 'center bottom',
            transformStyle: 'preserve-3d',
            transform: faceZoom === 'closeup' ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          <defs>
            {/* Lifelike Subsurface Skin Gradient */}
            <radialGradient id="realSkinTones" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#F8D3BD" />
              <stop offset="55%" stopColor="#EBBA98" />
              <stop offset="85%" stopColor="#DC9B75" />
              <stop offset="100%" stopColor="#C47E56" />
            </radialGradient>

            {/* Neck Ambient Occlusion */}
            <linearGradient id="neckShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B36E4A" />
              <stop offset="100%" stopColor="#DC9B75" />
            </linearGradient>

            {/* Deep Layered Dark Hair Gradient */}
            <linearGradient id="realHairShading" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2E170E" />
              <stop offset="45%" stopColor="#1E0D06" />
              <stop offset="100%" stopColor="#0B0402" />
            </linearGradient>

            {/* Realistic Hazel-Brown Iris with Radial Depth */}
            <radialGradient id="realIrisGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#9C5E2D" />
              <stop offset="35%" stopColor="#69391A" />
              <stop offset="75%" stopColor="#3E1E0B" />
              <stop offset="100%" stopColor="#180A04" />
            </radialGradient>

            {/* Tailored Educator Blazer Fabric Gradient */}
            <linearGradient id="blazerFabric" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A4A35" />
              <stop offset="50%" stopColor="#3A3A28" />
              <stop offset="100%" stopColor="#2A2A1C" />
            </linearGradient>

            {/* Inner Silk Blouse */}
            <linearGradient id="silkBlouse" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF7" />
              <stop offset="100%" stopColor="#EAE5D9" />
            </linearGradient>

            {/* Eye Sockets */}
            <clipPath id="anatLeftEyeClip">
              <path d="M 82 118 Q 97 106 112 118 Q 97 127 82 118 Z" />
            </clipPath>
            <clipPath id="anatRightEyeClip">
              <path d="M 128 118 Q 143 106 158 118 Q 143 127 128 118 Z" />
            </clipPath>
          </defs>

          {/* Shoulders & Torso Respiration Animation */}
          <motion.g
            animate={{
              scaleY: [1, kinematics.torsoScaleY, 1],
              scaleX: [1, kinematics.torsoScaleX, 1],
              y: [0, kinematics.torsoY, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: kinematics.breathingDurationSec || 3.8,
              ease: kinematics.breathingCurve || [0.45, 0.05, 0.55, 0.95],
            }}
            style={{ transformOrigin: '120px 290px' }}
          >
            {/* Blazer Body */}
            <path
              d="M 40 290 Q 44 212 90 200 L 150 200 Q 196 212 200 290 Z"
              fill="url(#blazerFabric)"
            />
            {/* Silk V-Neck Blouse */}
            <path d="M 98 200 L 120 238 L 142 200 Z" fill="url(#silkBlouse)" />
            <path
              d="M 120 216 L 120 238"
              stroke="#D8CFBD"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Tailored Lapels with Realistic Depth */}
            <path d="M 88 200 L 114 246 L 102 248 L 78 200 Z" fill="#2E2E20" />
            <path d="M 152 200 L 126 246 L 138 248 L 162 200 Z" fill="#2E2E20" />

            {/* Teacher Gold Enamel Badge */}
            <rect
              x="148"
              y="238"
              width="44"
              height="15"
              rx="7.5"
              fill="#1F130B"
              stroke="#E5B94E"
              strokeWidth="1.2"
            />
            <text
              x="170"
              y="248.5"
              fontSize="7.5"
              fontWeight="bold"
              fill="#FFFFFF"
              textAnchor="middle"
              letterSpacing="0.6"
            >
              MS. PRIYA
            </text>
          </motion.g>

          {/* 3D Anatomical Head & Face */}
          <motion.g
            animate={{
              rotateY: currentHeadOrientation.yaw,
              rotateX: currentHeadOrientation.pitch,
              rotateZ: currentHeadOrientation.roll,
              y: kinematics.headY,
            }}
            transition={springTransition}
            style={{ transformOrigin: '120px 185px' }}
          >
            {/* Hair Bun with Traditional Gold Clip */}
            <circle cx="120" cy="40" r="28" fill="url(#realHairShading)" />
            <ellipse cx="120" cy="38" rx="20" ry="6" fill="#140703" />
            <line
              x1="94"
              y1="34"
              x2="146"
              y2="42"
              stroke="#E5B94E"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Anatomical Neck with Soft Shading */}
            <path d="M 106 162 L 106 202 L 134 202 L 134 162 Z" fill="url(#neckShadow)" />

            {/* Face Geometry & Jawline */}
            <path
              d="M 70 102 C 70 58 170 58 170 102 C 170 154 144 180 120 180 C 96 180 70 154 70 102 Z"
              fill="url(#realSkinTones)"
            />

            {/* Soft Cheek Flush & Contouring */}
            <ellipse cx="88" cy="135" rx="10" ry="5.5" fill="#E86E50" opacity="0.28" />
            <ellipse cx="152" cy="135" rx="10" ry="5.5" fill="#E86E50" opacity="0.28" />

            {/* Hair Volume Front & Sides */}
            <path
              d="M 68 106 C 66 66 85 48 120 48 C 155 48 174 66 172 106 C 166 80 148 68 120 68 C 92 68 74 80 68 106 Z"
              fill="url(#realHairShading)"
            />
            {/* Elegant Side Swept Strands */}
            <path
              d="M 78 72 Q 105 84 125 76 Q 100 70 78 72 Z"
              fill="#3A1F13"
              opacity="0.9"
            />

            {/* Realistic Eyebrows with State Elevation */}
            <motion.path
              animate={{
                y:
                  effectiveState === 'THINKING'
                    ? -2.5
                    : effectiveState === 'LISTENING'
                    ? -1.8
                    : effectiveState === 'CONFUSED'
                    ? -1.0
                    : 0,
                rotate: effectiveState === 'CONFUSED' ? -3 : 0,
              }}
              transition={{ duration: 0.25 }}
              d="M 82 104 Q 97 98 112 103"
              stroke="#1C0C06"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            <motion.path
              animate={{
                y:
                  effectiveState === 'THINKING'
                    ? -2.5
                    : effectiveState === 'LISTENING'
                    ? -1.8
                    : effectiveState === 'CONFUSED'
                    ? 1.5
                    : 0,
                rotate: effectiveState === 'CONFUSED' ? 4 : 0,
              }}
              transition={{ duration: 0.25 }}
              d="M 128 103 Q 143 98 158 104"
              stroke="#1C0C06"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* 👁️ LEFT EYE: Sclera, Hazel Iris, Pupil Gaze Tracking & Eyelids */}
            <g clipPath="url(#anatLeftEyeClip)">
              {/* Sclera */}
              <path d="M 82 118 Q 97 106 112 118 Q 97 127 82 118 Z" fill="#FFFDFB" />
              {/* Tear Duct (Caruncle) */}
              <ellipse cx="84" cy="118" rx="2" ry="1.5" fill="#E89B85" opacity="0.6" />

              {/* Dynamic Tracking Iris & Pupil */}
              <motion.g
                animate={{ x: currentEyeGaze.x, y: currentEyeGaze.y }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              >
                {/* Iris */}
                <circle cx="97" cy="117" r="5.8" fill="url(#realIrisGrad)" />
                {/* Limbal Ring */}
                <circle cx="97" cy="117" r="5.8" fill="none" stroke="#120602" strokeWidth="0.8" />
                {/* Pupil */}
                <circle cx="97" cy="117" r="2.6" fill="#0A0402" />
                {/* Primary Corneal Specular Glint */}
                <circle cx="98.8" cy="115.2" r="1.4" fill="#FFFFFF" />
                {/* Secondary Soft Reflection */}
                <circle cx="95.4" cy="118.4" r="0.7" fill="#FFFFFF" opacity="0.7" />
              </motion.g>

              {/* Upper Eyelid Natural Blinker */}
              <motion.path
                d="M 80 106 Q 97 106 114 106 L 114 130 L 80 130 Z"
                animate={{
                  y: avatarState.isBlinking ? 14 : 0,
                }}
                transition={{ duration: 0.12, ease: 'easeInOut' }}
                fill="#DC9B75"
              />
            </g>
            {/* Left Upper Eyelash Fringe */}
            <path
              d="M 82 118 Q 97 106 112 118"
              stroke="#1F0D06"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />

            {/* 👁️ RIGHT EYE: Sclera, Hazel Iris, Pupil Gaze Tracking & Eyelids */}
            <g clipPath="url(#anatRightEyeClip)">
              {/* Sclera */}
              <path d="M 128 118 Q 143 106 158 118 Q 143 127 128 118 Z" fill="#FFFDFB" />
              {/* Tear Duct */}
              <ellipse cx="156" cy="118" rx="2" ry="1.5" fill="#E89B85" opacity="0.6" />

              {/* Dynamic Tracking Iris & Pupil */}
              <motion.g
                animate={{ x: currentEyeGaze.x, y: currentEyeGaze.y }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              >
                {/* Iris */}
                <circle cx="143" cy="117" r="5.8" fill="url(#realIrisGrad)" />
                {/* Limbal Ring */}
                <circle cx="143" cy="117" r="5.8" fill="none" stroke="#120602" strokeWidth="0.8" />
                {/* Pupil */}
                <circle cx="143" cy="117" r="2.6" fill="#0A0402" />
                {/* Primary Corneal Specular Glint */}
                <circle cx="144.8" cy="115.2" r="1.4" fill="#FFFFFF" />
                {/* Secondary Soft Reflection */}
                <circle cx="141.4" cy="118.4" r="0.7" fill="#FFFFFF" opacity="0.7" />
              </motion.g>

              {/* Upper Eyelid Natural Blinker */}
              <motion.path
                d="M 126 106 Q 143 106 160 106 L 160 130 L 126 130 Z"
                animate={{
                  y: avatarState.isBlinking ? 14 : 0,
                }}
                transition={{ duration: 0.12, ease: 'easeInOut' }}
                fill="#DC9B75"
              />
            </g>
            {/* Right Upper Eyelash Fringe */}
            <path
              d="M 128 118 Q 143 106 158 118"
              stroke="#1F0D06"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Subtle Sculpted Nose Bridge & Nostril Definition */}
            <path
              d="M 120 112 L 118 134 Q 115 142 120 144 Q 125 142 122 134"
              stroke="#BD7E58"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="116" cy="143" rx="2" ry="1.2" fill="#9C5E3A" opacity="0.55" />
            <ellipse cx="124" cy="143" rx="2" ry="1.2" fill="#9C5E3A" opacity="0.55" />

            {/* Stylish Tortoiseshell Glasses with Gold Metallic Bridge */}
            <circle cx="97" cy="117" r="15" fill="none" stroke="#261A13" strokeWidth="2.6" />
            <circle cx="143" cy="117" r="15" fill="none" stroke="#261A13" strokeWidth="2.6" />
            {/* Gold Bridge */}
            <path
              d="M 112 114 Q 120 110 128 114"
              stroke="#D4AF37"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Glasses Glass Sheen */}
            <line
              x1="88"
              y1="108"
              x2="98"
              y2="124"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.4"
            />
            <line
              x1="134"
              y1="108"
              x2="144"
              y2="124"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* 👄 REALISTIC SPEAKING MOUTH WITH VISEMES & SMILE */}
            <motion.g
              style={{ transformOrigin: '120px 160px' }}
              animate={
                isSpeaking
                  ? {
                      scaleY: [1, 1.35, 0.9, 1.25, 1],
                      scaleX: [1, 0.95, 1.05, 0.98, 1],
                    }
                  : { scaleY: 1, scaleX: 1 }
              }
              transition={
                isSpeaking
                  ? { repeat: Infinity, duration: 0.42, ease: 'easeInOut' }
                  : { duration: 0.2 }
              }
            >
              {isSpeaking ? (
                // Speaking Viseme: Parted lips, teeth glint, and vocal aperture
                <g>
                  <ellipse cx="120" cy="160" rx="8.5" ry="5.5" fill="#881B34" />
                  {/* Teeth */}
                  <rect x="114" y="156.5" width="12" height="3" rx="1.5" fill="#FFFDF8" />
                  {/* Tongue */}
                  <ellipse cx="120" cy="163" rx="5" ry="2.2" fill="#D85A75" />
                  {/* Upper Lip Contour */}
                  <path
                    d="M 110 157 Q 115 154 120 156 Q 125 154 130 157"
                    stroke="#B8425C"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              ) : (
                // Resting Warm Natural Smile
                <g>
                  {/* Upper Lip Crease */}
                  <path
                    d="M 111 158 Q 115.5 156 120 157 Q 124.5 156 129 158"
                    stroke="#B03A53"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Lower Lip Fullness & Smile Curve */}
                  <path
                    d="M 112 158 Q 120 166 128 158"
                    stroke="#C44863"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Soft Lip Sheen */}
                  <path
                    d="M 116 162 Q 120 164 124 162"
                    stroke="#FF8DA4"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.75"
                    fill="none"
                  />
                </g>
              )}
            </motion.g>
          </motion.g>
        </motion.svg>
      )}
    </motion.div>
  );
};
