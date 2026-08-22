/**
 * Audio Streamer for Gemini Live API
 * Handles 16kHz PCM Microphone Capture & 24kHz PCM Speaker Playback
 */

export class AudioStreamer {
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private nextStartTime: number = 0;
  private onAudioChunkCallback: ((base64Pcm: string) => void) | null = null;

  constructor(onAudioChunk?: (base64Pcm: string) => void) {
    if (onAudioChunk) {
      this.onAudioChunkCallback = onAudioChunk;
    }
  }

  public setAudioChunkCallback(callback: (base64Pcm: string) => void) {
    this.onAudioChunkCallback = callback;
  }

  /**
   * Start microphone capture at 16,000 Hz mono 16-bit PCM
   */
  public async startCapture(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      this.inputAudioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate: 16000,
      });

      const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const pcm16Buffer = this.floatTo16BitPCM(inputData);
        const base64Data = this.arrayBufferToBase64(pcm16Buffer);

        if (this.onAudioChunkCallback) {
          this.onAudioChunkCallback(base64Data);
        }
      };

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioContext.destination);
    } catch (error) {
      console.error('[AudioStreamer] Microphone Capture Error:', error);
      throw error;
    }
  }

  /**
   * Stop microphone capture
   */
  public stopCapture(): void {
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch (e) {
        console.warn(e);
      }
      this.scriptProcessor = null;
    }

    if (this.inputAudioContext) {
      try {
        this.inputAudioContext.close();
      } catch (e) {
        console.warn(e);
      }
      this.inputAudioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  /**
   * Queue and play 24kHz PCM audio chunk
   */
  public playChunk(base64Pcm: string): void {
    if (!this.outputAudioContext) {
      this.outputAudioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate: 24000,
      });
    }

    if (this.outputAudioContext.state === 'suspended') {
      this.outputAudioContext.resume();
    }

    try {
      const buffer = this.base64ToArrayBuffer(base64Pcm);
      const int16Array = new Int16Array(buffer);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = this.outputAudioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);

      const currentTime = this.outputAudioContext.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.currentSourceNode = source;
    } catch (err) {
      console.error('[AudioStreamer] Playback Error:', err);
    }
  }

  /**
   * Interrupt playback instantly when user speaks (barge-in)
   */
  public interrupt(): void {
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
      } catch (e) {
        console.warn(e);
      }
      this.currentSourceNode = null;
    }
    if (this.outputAudioContext) {
      this.nextStartTime = this.outputAudioContext.currentTime;
    }
  }

  /**
   * Stop all capture and playback
   */
  public stopAll(): void {
    this.stopCapture();
    this.interrupt();
    if (this.outputAudioContext) {
      try {
        this.outputAudioContext.close();
      } catch (e) {
        console.warn(e);
      }
      this.outputAudioContext = null;
    }
  }

  // --- Helper methods ---

  private floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return typeof window !== 'undefined' ? window.btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  }
}
