import { useState, useCallback, useRef, useEffect } from 'react';
import { ModelSetupModal } from './components/ModelSetupModal';
import { VoicePanel }      from './components/VoicePanel';
import { WorkflowPanel }   from './components/WorkflowPanel';
import { useAIWorker }     from './hooks/useAIWorker';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useWorkflow }     from './hooks/useWorkflow';
import './styles/global.css';

const STORAGE_KEY = 'greatprompt_models_ready';

function ModelStatusBadge({ modelsReady, loading, skipped }) {
  if (modelsReady)  return <span className="model-status-badge ready">Models Ready</span>;
  if (loading)      return <span className="model-status-badge loading">Loading…</span>;
  if (skipped)      return <span className="model-status-badge skipped">Text Only</span>;
  return null;
}

export default function App() {
  const [showModal,   setShowModal]   = useState(!localStorage.getItem(STORAGE_KEY));
  const [modelsReady, setModelsReady] = useState(!!localStorage.getItem(STORAGE_KEY));
  const [modelsSkipped, setModelsSkipped] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modalProgress, setModalProgress] = useState({ state: 'idle', label: '', pct: 0 });
  const [transcript,  setTranscript]  = useState('');
  const [micToast,    setMicToast]    = useState(null);

  const { workerReady, loadProgress, modelProgress, loadModels, transcribe } = useAIWorker();
  const { isRecording, error: micError, clearError, startRecording, stopRecording } = useAudioRecorder();
  const { workflowState, goToStep, updateState, reset } = useWorkflow();

  const [isProcessing, setIsProcessing] = useState(false);

  // Sync worker load progress → modal
  useEffect(() => {
    if (loadingModels && loadProgress.label) {
      setModalProgress({ state: 'downloading', label: loadProgress.label, pct: loadProgress.pct });
    }
  }, [loadProgress, loadingModels]);

  const handleDownload = async () => {
    setLoadingModels(true);
    setModalProgress({ state: 'downloading', label: 'Starting download…', pct: 0 });
    try {
      await loadModels();
      setModalProgress({ state: 'done', label: '', pct: 100 });
      setModelsReady(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      setTimeout(() => setShowModal(false), 1500);
    } catch (e) {
      console.error('Model load failed', e);
      setLoadingModels(false);
      setModalProgress({ state: 'idle', label: '', pct: 0 });
    }
  };

  const handleSkip = () => {
    setShowModal(false);
    setModelsSkipped(true);
    localStorage.setItem(STORAGE_KEY, 'skipped');
  };

  const handleMicClick = async () => {
    if (!modelsReady && !workerReady && !isRecording) {
      setMicToast('Models still loading. Type your intent directly.');
      setTimeout(() => setMicToast(null), 3000);
      return;
    }

    if (isRecording) {
      const blob = await stopRecording();
      if (!blob) return;
      setIsProcessing(true);
      try {
        const text = await transcribe(blob);
        setTranscript(text || '');
      } catch (e) {
        console.error('Transcribe error', e);
      } finally {
        setIsProcessing(false);
      }
    } else {
      await startRecording();
    }
  };

  const handleAnalyze = (text) => {
    if (text.trim().length < 5) return;
    // Reset and navigate to step 1 atomically to avoid batching issues
    updateState({ currentStep: 1, intent: '', domain: '', answers: {}, context: '', finalPrompt: '' });
  };

  const handleReset = useCallback(() => {
    reset();
    setTranscript('');
  }, [reset]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <span className="app-header-logo">greatprompt.io</span>
        <span className="app-header-subtitle">100% local · in-browser AI</span>
        <div className="app-header-spacer" />
        <ModelStatusBadge
          modelsReady={modelsReady || workerReady}
          loading={loadingModels && !modelsReady}
          skipped={modelsSkipped}
        />
      </header>

      {/* Panels */}
      <div className="app-panels">
        <VoicePanel
          modelsReady={modelsReady || workerReady}
          transcript={transcript}
          onTranscriptChange={setTranscript}
          onAnalyze={handleAnalyze}
          isRecording={isRecording}
          isProcessing={isProcessing}
          micError={micToast || micError}
          onMicClick={handleMicClick}
        />
        <WorkflowPanel
          workflowState={workflowState}
          goToStep={goToStep}
          updateState={updateState}
          reset={handleReset}
          transcript={transcript}
          workerReady={workerReady}
        />
      </div>

      {/* First-run modal */}
      {showModal && (
        <ModelSetupModal
          onDownload={handleDownload}
          onSkip={handleSkip}
          progress={modalProgress}
          modelProgress={modelProgress}
        />
      )}
    </div>
  );
}
