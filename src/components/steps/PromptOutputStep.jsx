import { useState, useEffect, useCallback } from 'react';
import { buildPrompt } from '../../logic/promptBuilder';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';

export function PromptOutputStep({ workflowState, updateState, reset, enhancePrompt, workerReady }) {
  const [displayText, setDisplayText] = useState(workflowState.finalPrompt || '');
  const [enhancing, setEnhancing]     = useState(false);
  const [copied, setCopied]           = useState(false);

  const generate = useCallback((withEnhance = true) => {
    const base = buildPrompt(workflowState);

    if (workerReady && withEnhance && enhancePrompt) {
      setDisplayText('');
      setEnhancing(true);

      const messages = [
        {
          role: 'system',
          content: 'You are a prompt engineering expert. Rewrite the following prompt to be clearer, more specific, and more effective. Return only the improved prompt.',
        },
        { role: 'user', content: base },
      ];

      let accumulated = '';
      enhancePrompt(messages, (token, done) => {
        if (!done) {
          accumulated += token;
          setDisplayText(accumulated);
        } else {
          setEnhancing(false);
          const final = accumulated || base;
          setDisplayText(final);
          updateState({ finalPrompt: final });
        }
      });
    } else {
      setDisplayText(base);
      updateState({ finalPrompt: base });
    }
  }, [workflowState, workerReady, enhancePrompt, updateState]);

  useEffect(() => {
    if (!workflowState.finalPrompt) {
      generate(true);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRegenerate = () => {
    updateState({ finalPrompt: '' });
    generate(true);
  };

  return (
    <div className="step-container">
      <h2 className="step-title">Your Enhanced Prompt</h2>
      <p className="step-subtitle">
        {enhancing ? 'AI is refining your prompt…' : 'Ready to use. Copy or regenerate.'}
      </p>

      <div className="prompt-output-wrap">
        <span className="prompt-output-label">Enhanced Prompt</span>
        <div className="prompt-output-box">
          {enhancing && !displayText ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)' }}>
              <Spinner size={14} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>Generating…</span>
            </div>
          ) : (
            <pre className="prompt-output-text">{displayText}</pre>
          )}
        </div>
      </div>

      <div className="prompt-actions">
        <Button variant="primary" onClick={handleCopy} disabled={!displayText || enhancing}>
          {copied ? '✓ Copied!' : 'Copy'}
        </Button>
        <Button variant="secondary" onClick={handleRegenerate} disabled={enhancing}>
          Regenerate
        </Button>
        <Button variant="ghost" onClick={reset}>
          Start Over
        </Button>
      </div>

      <p className="prompt-footer">100% local · no data sent</p>
    </div>
  );
}
