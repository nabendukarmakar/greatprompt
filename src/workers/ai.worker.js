import { pipeline, env, TextStreamer } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache  = true;

let asr = null;
let llm = null;

self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'LOAD_MODELS') {
      asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
        progress_callback: p => postMessage({ type: 'LOAD_PROGRESS', ...p, model: 'whisper' }),
      });

      // Use onnx-community org for Qwen2.5 in Transformers.js v3; q4 quantization for WASM perf
      llm = await pipeline('text-generation', 'onnx-community/Qwen2.5-0.5B-Instruct', {
        dtype: 'q4',
        progress_callback: p => postMessage({ type: 'LOAD_PROGRESS', ...p, model: 'qwen' }),
      });

      postMessage({ type: 'LOAD_DONE' });
    }

    if (data.type === 'TRANSCRIBE') {
      if (!asr) {
        postMessage({ type: 'ERROR', message: 'ASR model not loaded' });
        return;
      }
      // data.audioBuffer is a Float32Array resampled to 16 kHz by the main thread
      const result = await asr(data.audioBuffer, {
        language: 'english',
        task: 'transcribe',
        chunk_length_s: 30,
      });
      postMessage({ type: 'TRANSCRIBE_RESULT', text: result.text });
    }

    if (data.type === 'ENHANCE_PROMPT') {
      if (!llm) {
        postMessage({ type: 'ERROR', message: 'LLM model not loaded' });
        return;
      }

      // TextStreamer decodes token IDs → text chunks and calls callback with strings
      const streamer = new TextStreamer(llm.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: text => {
          postMessage({ type: 'ENHANCE_RESULT', token: text, done: false });
        },
      });

      await llm(data.messages, {
        max_new_tokens: 512,
        temperature: 0.6,
        do_sample: true,
        streamer,
      });

      postMessage({ type: 'ENHANCE_RESULT', token: '', done: true });
    }
  } catch (err) {
    postMessage({ type: 'ERROR', message: err.message || 'Unknown error in AI worker' });
  }
};
