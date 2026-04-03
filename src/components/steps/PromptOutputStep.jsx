import { useState, useEffect } from 'react';
import { buildPrompt } from '../../logic/promptBuilder';
import { Button } from '../common/Button';

export function PromptOutputStep({ workflowState, updateState, reset }) {
  const [displayText, setDisplayText] = useState(workflowState.finalPrompt || '');
  const [copied, setCopied]           = useState(false);

  useEffect(() => {
    if (!workflowState.finalPrompt) {
      const prompt = buildPrompt(workflowState);
      setDisplayText(prompt);
      updateState({ finalPrompt: prompt });
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
    const prompt = buildPrompt(workflowState);
    setDisplayText(prompt);
    updateState({ finalPrompt: prompt });
  };

  return (
    <div className="step-container">
      <h2 className="step-title">Your Prompt</h2>
      <p className="step-subtitle">Ready to use. Copy or start over.</p>

      <div className="prompt-output-wrap">
        <span className="prompt-output-label">Generated Prompt</span>
        <div className="prompt-output-box">
          <pre className="prompt-output-text">{displayText}</pre>
        </div>
      </div>

      <div className="prompt-actions">
        <Button variant="primary" onClick={handleCopy} disabled={!displayText}>
          {copied ? '✓ Copied!' : 'Copy'}
        </Button>
        <Button variant="secondary" onClick={handleRegenerate}>
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
