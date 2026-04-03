import { useEffect, useRef, useState, useCallback } from 'react';
import AIWorker from '../workers/ai.worker.js?worker';

export function useAIWorker() {
  const workerRef      = useRef(null);
  const pendingRef     = useRef({});
  const [workerReady,   setWorkerReady]   = useState(false);
  const [loadProgress,  setLoadProgress]  = useState({ label: '', pct: 0 });
  const [modelProgress, setModelProgress] = useState({
    whisper: { pct: 0, label: '', done: false },
    qwen:    { pct: 0, label: '', done: false },
  });

  useEffect(() => {
    const worker = new AIWorker();
    workerRef.current = worker;

    worker.onmessage = ({ data }) => {
      switch (data.type) {
        case 'LOAD_PROGRESS': {
          // Transformers.js v3 reports progress as 0-100, not 0-1
          const pct  = data.progress != null ? Math.min(100, Math.round(data.progress)) : 0;
          const done = data.status === 'ready';
          const label = done
            ? 'Ready'
            : data.file
              ? `${data.status === 'progress' ? 'Downloading' : data.status} ${data.file}`
              : `Loading ${data.model}…`;
          setLoadProgress({ label, pct });
          if (data.model === 'whisper' || data.model === 'qwen') {
            setModelProgress(prev => ({
              ...prev,
              [data.model]: { pct: done ? 100 : pct, label, done },
            }));
          }
          break;
        }
        case 'LOAD_DONE':
          setWorkerReady(true);
          setModelProgress({ whisper: { pct: 100, label: 'Ready', done: true }, qwen: { pct: 100, label: 'Ready', done: true } });
          if (pendingRef.current.loadResolve) {
            pendingRef.current.loadResolve();
            delete pendingRef.current.loadResolve;
          }
          break;
        case 'TRANSCRIBE_RESULT':
          if (pendingRef.current.transcribeResolve) {
            pendingRef.current.transcribeResolve(data.text);
            delete pendingRef.current.transcribeResolve;
          }
          break;
        case 'ENHANCE_RESULT':
          if (pendingRef.current.enhanceCallback) {
            pendingRef.current.enhanceCallback(data.token, data.done);
            if (data.done) delete pendingRef.current.enhanceCallback;
          }
          break;
        case 'ERROR':
          console.error('[AIWorker]', data.message);
          // Reject any pending promise
          if (pendingRef.current.transcribeReject) {
            pendingRef.current.transcribeReject(new Error(data.message));
            delete pendingRef.current.transcribeReject;
          }
          break;
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  const loadModels = useCallback(() => {
    return new Promise(resolve => {
      pendingRef.current.loadResolve = resolve;
      workerRef.current.postMessage({ type: 'LOAD_MODELS' });
    });
  }, []);

  const transcribe = useCallback((blob) => {
    return new Promise(async (resolve, reject) => {
      pendingRef.current.transcribeResolve = resolve;
      pendingRef.current.transcribeReject  = reject;
      try {
        const TARGET_SR = 16000;
        const arrayBuffer = await blob.arrayBuffer();

        // Step 1: decode at native sample rate (decodeAudioData ignores context SR)
        const decodeCtx   = new AudioContext();
        const decoded     = await decodeCtx.decodeAudioData(arrayBuffer);
        await decodeCtx.close();

        // Step 2: resample to exactly 16 kHz via OfflineAudioContext
        const numFrames   = Math.ceil(decoded.duration * TARGET_SR);
        const offlineCtx  = new OfflineAudioContext(1, numFrames, TARGET_SR);
        const source      = offlineCtx.createBufferSource();
        source.buffer     = decoded;
        source.connect(offlineCtx.destination);
        source.start(0);
        const resampled   = await offlineCtx.startRendering();
        const float32     = resampled.getChannelData(0);

        // Transfer the underlying ArrayBuffer for zero-copy transfer to worker
        const copy = float32.slice(); // slice to own a fresh buffer we can transfer
        workerRef.current.postMessage(
          { type: 'TRANSCRIBE', audioBuffer: copy },
          [copy.buffer],
        );
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  const enhancePrompt = useCallback((messages, onToken) => {
    pendingRef.current.enhanceCallback = onToken;
    workerRef.current.postMessage({ type: 'ENHANCE_PROMPT', messages });
  }, []);

  return { workerReady, loadProgress, modelProgress, loadModels, transcribe, enhancePrompt };
}
