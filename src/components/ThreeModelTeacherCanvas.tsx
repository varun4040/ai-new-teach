import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { AvatarState, CharacterState } from '../types';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface ThreeModelTeacherCanvasProps {
  modelUrl: string;
  modelFormat: 'glb' | 'gltf' | 'obj';
  avatarState: AvatarState;
  teacherName?: string;
  interactiveEyeTracking?: boolean;
  faceZoom?: 'normal' | 'closeup' | 'large';
  isEnlarged?: boolean;
}

export const ThreeModelTeacherCanvas: React.FC<ThreeModelTeacherCanvasProps> = ({
  modelUrl,
  modelFormat,
  avatarState,
  interactiveEyeTracking = true,
  faceZoom = 'normal',
  isEnlarged = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);

  // References to keep Three scene alive without recreation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const headBoneRef = useRef<THREE.Object3D | null>(null);
  const morphMeshesRef = useRef<THREE.Mesh[]>([]);
  const requestFrameIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Mouse tracking targets
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentLookRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update mouse tracking coordinates on window mouse move
  useEffect(() => {
    if (!interactiveEyeTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to +1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseTargetRef.current = { x: x * 0.45, y: y * 0.35 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactiveEyeTracking]);

  // Adjust camera framing based on faceZoom and enlarged state
  useEffect(() => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;

    // Adjust camera Z or FOV
    if (faceZoom === 'closeup') {
      camera.position.set(0, 1.45, 1.3);
    } else {
      camera.position.set(0, 1.25, 2.0);
    }
    camera.lookAt(0, 1.25, 0);
  }, [faceZoom, isEnlarged]);

  // Main Three.js Scene Setup & Model Loading
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !modelUrl) return;

    setIsLoading(true);
    setLoadError(null);
    setLoadProgress(0);

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 360;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    if (faceZoom === 'closeup') {
      camera.position.set(0, 1.45, 1.3);
    } else {
      camera.position.set(0, 1.25, 2.0);
    }
    camera.lookAt(0, 1.25, 0);
    cameraRef.current = camera;

    // WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Clear container and append canvas
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (err: unknown) {
      console.error('WebGL init error:', err);
      setLoadError('WebGL is not supported or failed to initialize.');
      setIsLoading(false);
      return;
    }

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    mainKeyLight.position.set(2, 4, 3);
    mainKeyLight.castShadow = true;
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xd9ecff, 1.0);
    fillLight.position.set(-2, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffdfba, 1.4);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

    // Floor shadow catcher
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Load Model (.glb, .gltf, or .obj)
    const onProgress = (xhr: ProgressEvent<EventTarget>) => {
      if (xhr.lengthComputable && xhr.total > 0) {
        setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
      }
    };

    const setupLoadedObject = (object: THREE.Object3D, animations?: THREE.AnimationClip[]) => {
      // Auto-center and normalize scale
      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      // Scale model to standard height (~1.8m)
      const targetHeight = 1.8;
      const scaleFactor = targetHeight / (maxDim || 1);
      object.scale.setScalar(scaleFactor);

      // Recalculate after scaling
      box.setFromObject(object);
      box.getCenter(center);
      // Align bottom of model to y=0 and center in x, z
      object.position.x = -center.x;
      object.position.y = -box.min.y;
      object.position.z = -center.z;

      // Inspect bones & meshes
      morphMeshesRef.current = [];
      headBoneRef.current = null;

      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Double sided materials if transparent or clothing
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => {
                mat.side = THREE.DoubleSide;
              });
            } else {
              mesh.material.side = THREE.DoubleSide;
            }
          }

          // Check morph targets for blendshapes (mouth, eyes, etc.)
          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            morphMeshesRef.current.push(mesh);
          }
        }

        // Look for head bone in armature
        const lowerName = child.name.toLowerCase();
        if (
          !headBoneRef.current &&
          (lowerName.includes('head') || lowerName.includes('neck') || lowerName === 'head_01')
        ) {
          headBoneRef.current = child;
        }
      });

      // Animation mixer if animations exist
      if (animations && animations.length > 0) {
        const mixer = new THREE.AnimationMixer(object);
        const action = mixer.clipAction(animations[0]);
        action.play();
        mixerRef.current = mixer;
      } else {
        mixerRef.current = null;
      }

      const modelGroup = new THREE.Group();
      modelGroup.add(object);
      scene.add(modelGroup);
      modelRootRef.current = modelGroup;

      setIsLoading(false);
      setLoadError(null);
    };

    // If no custom model URL is provided yet, render a friendly 3D geometric teacher model avatar!
    if (!modelUrl) {
      const proceduralGroup = new THREE.Group();

      // Head
      const headGeo = new THREE.SphereGeometry(0.38, 32, 32);
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0xe0ac69,
        roughness: 0.6,
        metalness: 0.1,
      });
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headMesh.position.y = 1.35;
      headMesh.castShadow = true;
      proceduralGroup.add(headMesh);

      // Glasses Frame
      const glassesGroup = new THREE.Group();
      const frameGeo = new THREE.TorusGeometry(0.1, 0.02, 16, 32);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3 });

      const leftEyeFrame = new THREE.Mesh(frameGeo, frameMat);
      leftEyeFrame.position.set(-0.13, 1.37, 0.34);
      glassesGroup.add(leftEyeFrame);

      const rightEyeFrame = new THREE.Mesh(frameGeo, frameMat);
      rightEyeFrame.position.set(0.13, 1.37, 0.34);
      glassesGroup.add(rightEyeFrame);

      // Glasses bridge
      const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 16);
      const bridge = new THREE.Mesh(bridgeGeo, frameMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 1.37, 0.36);
      glassesGroup.add(bridge);

      proceduralGroup.add(glassesGroup);

      // Eyes (white + pupil)
      const eyeWhiteGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const pupilGeo = new THREE.SphereGeometry(0.03, 16, 16);
      const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a237e });

      const leftWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
      leftWhite.position.set(-0.13, 1.37, 0.31);
      proceduralGroup.add(leftWhite);

      const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
      leftPupil.position.set(-0.13, 1.37, 0.355);
      proceduralGroup.add(leftPupil);

      const rightWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
      rightWhite.position.set(0.13, 1.37, 0.31);
      proceduralGroup.add(rightWhite);

      const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
      rightPupil.position.set(0.13, 1.37, 0.355);
      proceduralGroup.add(rightPupil);

      // Gentle Smile
      const smileGeo = new THREE.TorusGeometry(0.08, 0.016, 16, 32, Math.PI);
      const smileMat = new THREE.MeshStandardMaterial({ color: 0x9c3d41 });
      const smileMesh = new THREE.Mesh(smileGeo, smileMat);
      smileMesh.position.set(0, 1.22, 0.34);
      smileMesh.rotation.x = Math.PI * 0.1;
      smileMesh.rotation.z = Math.PI;
      proceduralGroup.add(smileMesh);

      // Hair
      const hairGeo = new THREE.SphereGeometry(0.42, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x211c1d, roughness: 0.8 });
      const hairMesh = new THREE.Mesh(hairGeo, hairMat);
      hairMesh.position.set(0, 1.39, -0.02);
      hairMesh.rotation.x = -Math.PI * 0.1;
      proceduralGroup.add(hairMesh);

      // Torso / Teacher Blazer (Emerald)
      const torsoGeo = new THREE.CylinderGeometry(0.3, 0.42, 0.85, 32);
      const jacketMat = new THREE.MeshStandardMaterial({
        color: 0x1b4332,
        roughness: 0.7,
      });
      const torsoMesh = new THREE.Mesh(torsoGeo, jacketMat);
      torsoMesh.position.y = 0.65;
      torsoMesh.castShadow = true;
      proceduralGroup.add(torsoMesh);

      // Teacher Scarf / Saree detail
      const scarfGeo = new THREE.TorusGeometry(0.24, 0.06, 16, 32);
      const scarfMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
      const scarfMesh = new THREE.Mesh(scarfGeo, scarfMat);
      scarfMesh.position.set(0, 1.05, 0.05);
      scarfMesh.rotation.x = Math.PI * 0.4;
      proceduralGroup.add(scarfMesh);

      // Neck
      const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.22, 16);
      const neckMesh = new THREE.Mesh(neckGeo, skinMat);
      neckMesh.position.y = 1.05;
      proceduralGroup.add(neckMesh);

      headBoneRef.current = headMesh;
      setupLoadedObject(proceduralGroup);
    } else if (modelFormat === 'obj') {
      const objLoader = new OBJLoader();
      objLoader.load(
        modelUrl,
        (obj) => {
          setupLoadedObject(obj);
        },
        onProgress,
        (err) => {
          console.error('Failed to load OBJ:', err);
          setLoadError('Failed to parse .OBJ 3D model. Please check the file.');
          setIsLoading(false);
        }
      );
    } else {
      // GLTF / GLB Loader
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        modelUrl,
        (gltf) => {
          setupLoadedObject(gltf.scene, gltf.animations);
        },
        onProgress,
        (err) => {
          console.error('Failed to load GLTF/GLB:', err);
          setLoadError('Failed to load .GLB/.GLTF model. Ensure it is a valid 3D file.');
          setIsLoading(false);
        }
      );
    }

    // Animation Loop
    clockRef.current.start();
    const animate = () => {
      requestFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();
      const elapsed = clockRef.current.getElapsedTime();

      // Update animation mixer if active
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Smooth gaze tracking
      const targetX = mouseTargetRef.current.x;
      const targetY = mouseTargetRef.current.y;
      currentLookRef.current.x += (targetX - currentLookRef.current.x) * 0.08;
      currentLookRef.current.y += (targetY - currentLookRef.current.y) * 0.08;

      // Respiration / Subtle breathing animation on model root
      if (modelRootRef.current) {
        const breathScale = 1.0 + Math.sin(elapsed * 1.8) * 0.012;
        modelRootRef.current.scale.y = breathScale;

        // Subtle organic sway
        const swayAngle = Math.sin(elapsed * 0.8) * 0.02;
        modelRootRef.current.rotation.z = swayAngle;

        // If we found a head bone, rotate it towards mouse cursor
        if (headBoneRef.current) {
          headBoneRef.current.rotation.y = currentLookRef.current.x * 0.6;
          headBoneRef.current.rotation.x = -currentLookRef.current.y * 0.4;
        } else {
          // Rotate whole model slightly towards cursor
          modelRootRef.current.rotation.y = currentLookRef.current.x * 0.35;
        }
      }

      // Morph target animation (Speaking mouth movement & Blinking)
      const isSpeaking = avatarState.isSpeaking || avatarState.characterState === 'SPEAKING';
      const isBlinking = avatarState.isBlinking;

      if (morphMeshesRef.current.length > 0) {
        morphMeshesRef.current.forEach((mesh) => {
          const dict = mesh.morphTargetDictionary;
          const influences = mesh.morphTargetInfluences;
          if (!dict || !influences) return;

          // Mouth open / JawOpen / MouthOpen / Viseme
          const mouthOpenIdx =
            dict['jawOpen'] ??
            dict['mouthOpen'] ??
            dict['MouthOpen'] ??
            dict['viseme_aa'] ??
            dict['viseme_O'] ??
            dict['A01_Mouth_Open'];

          if (mouthOpenIdx !== undefined) {
            const targetMouth = isSpeaking ? (Math.sin(elapsed * 14) * 0.5 + 0.5) * 0.75 : 0;
            influences[mouthOpenIdx] = targetMouth;
          }

          // Eyes blink / EyesClosed / blink / EyeBlinkLeft
          const blinkLeftIdx =
            dict['blink_left'] ??
            dict['eyeBlinkLeft'] ??
            dict['eyeBlink_L'] ??
            dict['blink'] ??
            dict['Blink'];
          const blinkRightIdx =
            dict['blink_right'] ??
            dict['eyeBlinkRight'] ??
            dict['eyeBlink_R'] ??
            dict['blink'] ??
            dict['Blink'];

          if (blinkLeftIdx !== undefined) {
            influences[blinkLeftIdx] = isBlinking ? 1.0 : 0;
          }
          if (blinkRightIdx !== undefined) {
            influences[blinkRightIdx] = isBlinking ? 1.0 : 0;
          }
        });
      }

      // Render Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 340;
      const h = container.clientHeight || 360;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (requestFrameIdRef.current) {
        cancelAnimationFrame(requestFrameIdRef.current);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
    };
  }, [modelUrl, modelFormat]);

  return (
    <div
      className={`relative w-full ${
        isEnlarged
          ? 'h-80 sm:h-96 md:h-[450px]'
          : 'h-64 sm:h-72 md:h-[350px]'
      } rounded-3xl overflow-hidden shadow-2xl border-4 border-[#5A5A40] bg-gradient-to-b from-[#E8F3EF] via-[#F4F8F6] to-[#D5E5DE] flex items-center justify-center`}
    >
      {/* 3D WebGL Canvas Mounting Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 z-20">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs font-bold tracking-wide">
            Loading 3D Teacher Model ({modelFormat.toUpperCase()})...
          </span>
          {loadProgress > 0 && (
            <div className="w-36 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-150"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error Notice */}
      {loadError && (
        <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center text-center p-6 text-white gap-3 z-30">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <div>
            <h4 className="text-sm font-bold text-rose-300">Model Load Failed</h4>
            <p className="text-xs text-gray-300 mt-1 max-w-xs">{loadError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold cursor-pointer border border-white/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
        </div>
      )}

      {/* 3D Model Badge */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-bold text-white border border-white/20 pointer-events-none z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>3D {modelFormat.toUpperCase()} Teacher</span>
      </div>
    </div>
  );
};
