import { useState, useEffect } from 'react';
import { extractIntent } from '../../logic/intentParser';
import { detectDomains } from '../../logic/domainDetector';
import { Button } from '../common/Button';

export function IntentStep({ transcript, workflowState, updateState, goToStep }) {
  const [thinking, setThinking]     = useState(true);
  const [intent,   setIntent]       = useState(workflowState.intent || '');
  const [domains,  setDomains]      = useState([]);
  const [selected, setSelected]     = useState(workflowState.domain || '');

  useEffect(() => {
    if (workflowState.intent && workflowState.domain) {
      // Already parsed, restore
      setThinking(false);
      setIntent(workflowState.intent);
      setDomains(detectDomains(transcript));
      setSelected(workflowState.domain);
      return;
    }

    const timer = setTimeout(() => {
      const parsedIntent  = extractIntent(transcript);
      const parsedDomains = detectDomains(transcript);
      const topDomain     = parsedDomains[0]?.label || 'General / Other';

      setIntent(parsedIntent);
      setDomains(parsedDomains);
      setSelected(topDomain);
      setThinking(false);

      updateState({ intent: parsedIntent, domain: topDomain });
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const handleDomainSelect = (label) => {
    setSelected(label);
    updateState({ domain: label });
  };

  const handleContinue = () => {
    updateState({ intent, domain: selected });
    goToStep(2);
  };

  return (
    <div className="step-container">
      <h2 className="step-title">What's your goal?</h2>
      <p className="step-subtitle">We've extracted your intent and detected the domain.</p>

      {thinking ? (
        <div className="think-dots" aria-label="Analyzing">
          <div className="think-dot" />
          <div className="think-dot" />
          <div className="think-dot" />
        </div>
      ) : (
        <>
          <div className="intent-card">
            <div className="intent-card-label">Your Goal</div>
            <div className="intent-card-text">"{intent}"</div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="voice-panel-section-label" style={{ marginBottom: 10 }}>Select Domain</div>
            <div className="domain-chips">
              {domains.map(d => (
                <button
                  key={d.label}
                  className={`domain-chip${selected === d.label ? ' selected' : ''}`}
                  onClick={() => handleDomainSelect(d.label)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <Button variant="primary" onClick={handleContinue} disabled={!selected}>
            This looks right →
          </Button>
        </>
      )}
    </div>
  );
}
