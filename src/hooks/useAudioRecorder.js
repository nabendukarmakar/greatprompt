import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError]             = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const startTimeRef     = useRef(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm', 'audio/mp4', 'audio/ogg']
        .find(t => MediaRecorder.isTypeSupported(t)) || '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      alert(err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Type your intent directly.');
      } else {
        setError('Could not access microphone.');
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise(resolve => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      const elapsed = Date.now() - (startTimeRef.current || 0);

      recorder.onstop = () => {
        // Stop all tracks
        recorder.stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);

        if (elapsed < 500) {
          setError('Recording too short. Try again.');
          resolve(null);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isRecording, error, clearError, startRecording, stopRecording };
}
