import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache  = true;

let asr = null;

self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'LOAD_MODELS') {
      asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
        progress_callback: p => postMessage({ type: 'LOAD_PROGRESS', ...p, model: 'whisper' }),
      });
      postMessage({ type: 'LOAD_DONE' });
    }

    if (data.type === 'TRANSCRIBE') {
      if (!asr) {
        postMessage({ type: 'ERROR', message: 'ASR model not loaded' });
        return;
      }
      const result = await asr(data.audioBuffer, {
        language: 'english',
        task: 'transcribe',
        chunk_length_s: 30,
      });
      postMessage({ type: 'TRANSCRIBE_RESULT', text: result.text });
    }
  } catch (err) {
    postMessage({ type: 'ERROR', message: err.message || 'Unknown error in AI worker' });
  }
};
