/**
 * GeminiLiveClient - Manages WebSocket connection, microphone PCM audio streaming (16kHz),
 * response audio playback (24kHz), video frame capture (1 FPS), and whiteboard tool call events.
 */

import { WhiteboardToolEvent } from '../types';

export interface GeminiLiveClientOptions {
  onAudioData?: (base64Pcm: string) => void;
  onTranscript?: (text: string) => void;
  onInterrupted?: () => void;
  onToolCall?: (toolCall: WhiteboardToolEvent) => void;
  onConnectionStatus?: (status: 'connecting' | 'connected' | 'disconnected' | 'dev_offline', notice?: string) => void;
  onError?: (err: string) => void;
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private options: GeminiLiveClientOptions;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private audioProcessor: ScriptProcessorNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isMicActive = false;
  private nextAudioStartTime = 0;

  constructor(options: GeminiLiveClientOptions) {
    this.options = options;
  }

  public connect(): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;

    this.options.onConnectionStatus?.('connecting');

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected to server');
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'connected') {
            this.options.onConnectionStatus?.(
              msg.mode === 'live_gemini' ? 'connected' : 'dev_offline',
              msg.notice
            );
          } else if (msg.type === 'audio' && msg.data) {
            this.playAudioChunk(msg.data);
            this.options.onAudioData?.(msg.data);
          } else if (msg.type === 'transcript' && msg.text) {
            this.options.onTranscript?.(msg.text);
          } else if (msg.type === 'interrupted') {
            this.stopPlayback();
            this.options.onInterrupted?.();
          } else if (msg.type === 'tool_call' && msg.toolCall) {
            this.options.onToolCall?.(msg.toolCall);
          } else if (msg.type === 'error') {
            this.options.onError?.(msg.error);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.options.onConnectionStatus?.('dev_offline', 'Live WebSocket closed. Active in local Dev Classroom mode.');
      };

      this.ws.onerror = (_err) => {
        console.warn('WebSocket connection notice: Running in local Dev Classroom mode.');
        this.options.onConnectionStatus?.('dev_offline', 'Dev Classroom fallback active.');
      };
    } catch (err: any) {
      console.warn('WebSocket init notice:', err);
      this.options.onConnectionStatus?.('dev_offline', 'Dev Classroom mode active.');
    }
  }

  public async startMicrophone(): Promise<boolean> {
    if (this.isMicActive) return true;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      const source = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
      this.audioProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      source.connect(this.audioProcessor);
      this.audioProcessor.connect(this.inputAudioCtx.destination);

      this.audioProcessor.onaudioprocess = (e) => {
        if (!this.isMicActive || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const float32Data = e.inputBuffer.getChannelData(0);
        const pcm16 = this.convertFloat32ToPCM16(float32Data);
        const base64Audio = this.arrayBufferToBase64(pcm16.buffer as ArrayBuffer);

        this.ws.send(JSON.stringify({ type: 'audio_chunk', audio: base64Audio }));
      };

      this.isMicActive = true;
      return true;
    } catch (err: any) {
      const isPermissionDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.message?.includes('Permission denied') ||
        err?.message?.includes('Permission dismissed');

      const notice = isPermissionDenied
        ? 'Microphone permission denied or unavailable in this browser frame. You can use text chat!'
        : `Microphone access error: ${err?.message || String(err)}`;

      console.warn('Microphone access notice:', notice);
      this.options.onError?.(notice);
      return false;
    }
  }

  public stopMicrophone(): void {
    this.isMicActive = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioProcessor) {
      this.audioProcessor.disconnect();
      this.audioProcessor = null;
    }
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close();
      this.inputAudioCtx = null;
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public sendTextMessage(text: string, classroomState?: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'text_message', text, classroomState }));
    }
  }

  public sendVideoFrame(base64Image: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'video_frame', image: base64Image }));
    }
  }

  public stopPlayback(): void {
    if (this.outputAudioCtx) {
      try {
        this.outputAudioCtx.close();
      } catch (e) {}
      this.outputAudioCtx = null;
    }
    this.nextAudioStartTime = 0;
  }

  private playAudioChunk(base64Pcm: string): void {
    try {
      if (!this.outputAudioCtx) {
        this.outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        this.nextAudioStartTime = this.outputAudioCtx.currentTime;
      }

      const binary = atob(base64Pcm);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const buffer = this.outputAudioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.outputAudioCtx.destination);

      const now = this.outputAudioCtx.currentTime;
      const startTime = Math.max(now, this.nextAudioStartTime);
      source.start(startTime);
      this.nextAudioStartTime = startTime + buffer.duration;
    } catch (e) {
      console.error('Audio chunk playback error:', e);
    }
  }

  private convertFloat32ToPCM16(buffer: Float32Array): Int16Array {
    const l = buffer.length;
    const result = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return result;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  public disconnect(): void {
    this.stopMicrophone();
    this.stopPlayback();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
