import { useState } from 'react';
import { Button } from '../common/Button';

export function ContextStep({ workflowState, updateState, goToStep }) {
  const [context, setContext] = useState(workflowState.context || '');

  const handleChange = (value) => {
    setContext(value);
    updateState({ context: value });
  };

  return (
    <div className="step-container">
      <h2 className="step-title">Any extra context?</h2>
      <p className="step-subtitle">Add constraints, requirements, or background info to refine your prompt.</p>

      <textarea
        className="context-textarea"
        value={context}
        onChange={e => handleChange(e.target.value)}
        placeholder="e.g. Keep it under 200 words. Target audience is senior engineers…"
        rows={6}
      />

      <Button variant="primary" onClick={() => goToStep(4)}>
        Generate Prompt →
      </Button>
    </div>
  );
}
