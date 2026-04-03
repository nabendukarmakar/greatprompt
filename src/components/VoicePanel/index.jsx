import { Waveform } from '../common/Waveform';
import { Spinner } from '../common/Spinner';
import { Button } from '../common/Button';

function MicIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
    </svg>
  );
}

export function VoicePanel({
  modelsReady,
  transcript,
  onTranscriptChange,
  onAnalyze,
  isRecording,
  isProcessing,
  micError,
  onMicClick,
}) {
  const getMicState = () => {
    if (isProcessing) return 'processing';
    if (isRecording)  return 'recording';
    return 'idle';
  };

  const micState = getMicState();

  const getMicStatusText = () => {
    if (isProcessing) return 'Transcribing…';
    if (isRecording)  return 'Recording — click to stop';
    return 'Click to record';
  };

  const isSafariOld = (() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent;
    if (!/Safari/.test(ua) || /Chrome/.test(ua)) return false;
    const m = ua.match(/Version\/(\d+)/);
    return m && parseInt(m[1]) < 14;
  })();

  return (
    <div className="voice-panel">
      {/* Mic area */}
      <div className="mic-area">
        {isSafariOld ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '8px 0' }}>
            Voice recording requires Safari 14.1+. Please type your intent below.
          </div>
        ) : (
          <>
            <button
              className={`mic-button ${micState}`}
              onClick={onMicClick}
              disabled={isProcessing}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              title={!modelsReady && !isRecording ? 'Models still loading. Type your intent directly.' : undefined}
            >
              {isProcessing
                ? <Spinner size={22} />
                : isRecording
                  ? <StopIcon />
                  : <MicIcon />
              }
            </button>
            {isRecording && <Waveform />}
          </>
        )}

        <div className="mic-status">{getMicStatusText()}</div>
      </div>

      {micError && (
        <div className="mic-error">{micError}</div>
      )}

      {/* Transcript */}
      <div className="transcript-section">
        <div className="voice-panel-section-label">Your Input</div>
        <textarea
          className="transcript-textarea"
          value={transcript}
          onChange={e => onTranscriptChange(e.target.value)}
          placeholder="Your transcribed speech will appear here. You can also type directly…"
          rows={6}
        />
      </div>

      {/* Action bar */}
      <div className="voice-action-bar">
        <Button
          variant="ghost"
          onClick={() => onTranscriptChange('')}
          disabled={!transcript}
        >
          Clear
        </Button>
        <Button
          variant="primary"
          onClick={() => onAnalyze(transcript)}
          disabled={transcript.length < 5}
          style={{ flex: 1 }}
        >
          Analyze Intent →
        </Button>
      </div>
    </div>
  );
}
