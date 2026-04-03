import { Button } from '../common/Button';

function ModelRow({ name, size, progress, downloading }) {
  const { pct = 0, label = '', done = false } = progress || {};
  const active = (downloading || pct > 0) && !done;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div className="modal-model-row">
        <span className="modal-model-name">{name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {done ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--success)' }}>✓ Ready</span>
          ) : active ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>{pct}%</span>
          ) : (
            <span className="modal-model-size">{size}</span>
          )}
        </span>
      </div>
      {(active || done) && (
        <div className="modal-progress-bar">
          <div
            className="modal-progress-fill"
            style={{
              width: `${done ? 100 : pct}%`,
              background: done ? 'var(--success)' : 'var(--accent)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}
      {active && label && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>{label}</span>
      )}
    </div>
  );
}

export function ModelSetupModal({ onDownload, onSkip, progress, modelProgress }) {
  const { state = 'idle' } = progress || {};
  const isDownloading = state === 'downloading';
  const isDone        = state === 'done';

  // Block backdrop click during download
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isDownloading) onSkip();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 className="modal-title" id="modal-title">Welcome to greatprompt.io</h2>
        <p className="modal-subtitle">
          Download the Whisper speech-to-text model for local voice transcription.
          All processing stays 100% in your browser — nothing is sent to any server.{' '}
          <strong style={{ color: 'var(--accent)', fontWeight: 500 }}>
            This is a one-time download per browser.
          </strong>{' '}
          Models are cached and reused on every subsequent visit.
        </p>

        <div className="modal-models">
          <ModelRow
            name="Whisper Tiny"
            size="~150 MB"
            progress={modelProgress?.whisper}
            downloading={isDownloading}
          />
        </div>

        {isDone && (
          <div className="modal-done">
            <div className="modal-done-icon" style={{ color: 'var(--success)' }}>✓</div>
            <div className="modal-done-text">Models ready — closing…</div>
          </div>
        )}

        {!isDone && (
          <div className="modal-actions">
            {!isDownloading && (
              <Button variant="ghost" onClick={onSkip}>
                Skip (type only)
              </Button>
            )}
            <Button
              variant="primary"
              onClick={onDownload}
              disabled={isDownloading}
            >
              {isDownloading ? 'Downloading…' : 'Download Models'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
