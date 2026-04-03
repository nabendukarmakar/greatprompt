import { IntentStep }       from '../steps/IntentStep';
import { ClarifyStep }      from '../steps/ClarifyStep';
import { ContextStep }      from '../steps/ContextStep';
import { PromptOutputStep } from '../steps/PromptOutputStep';

const STEPS = [
  { label: 'Intent' },
  { label: 'Clarify' },
  { label: 'Context' },
  { label: 'Prompt' },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 7 6 11 12 3" />
    </svg>
  );
}

function Stepper({ currentStep }) {
  return (
    <div className="stepper">
      {STEPS.map((step, idx) => {
        const stepNum   = idx + 1;
        const isActive  = currentStep === stepNum;
        const isDone    = currentStep > stepNum;
        const circleClass = isDone ? 'done' : isActive ? 'active' : '';
        const labelClass  = isDone ? 'done' : isActive ? 'active' : '';

        return (
          <div key={step.label} className="stepper-node-wrap">
            <div className="stepper-node">
              <div className={`stepper-circle ${circleClass}`}>
                {isDone ? <CheckIcon /> : stepNum}
              </div>
              <span className={`stepper-label ${labelClass}`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`stepper-line${isDone ? ' done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlaceholderContent() {
  return (
    <div className="workflow-placeholder">
      <div className="workflow-placeholder-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
        </svg>
      </div>
      <h3 className="workflow-placeholder-title">Ready to craft your prompt</h3>
      <p className="workflow-placeholder-text">
        Record your voice or type your idea in the left panel, then click{' '}
        <strong style={{ color: 'var(--accent)' }}>Analyze Intent</strong> to begin the 4-step workflow.
      </p>
    </div>
  );
}

export function WorkflowPanel({
  workflowState,
  goToStep,
  updateState,
  reset,
  transcript,
  enhancePrompt,
  workerReady,
}) {
  const { currentStep } = workflowState;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <IntentStep
            transcript={transcript}
            workflowState={workflowState}
            updateState={updateState}
            goToStep={goToStep}
          />
        );
      case 2:
        return (
          <ClarifyStep
            workflowState={workflowState}
            updateState={updateState}
            goToStep={goToStep}
          />
        );
      case 3:
        return (
          <ContextStep
            workflowState={workflowState}
            updateState={updateState}
            goToStep={goToStep}
          />
        );
      case 4:
        return (
          <PromptOutputStep
            workflowState={workflowState}
            updateState={updateState}
            reset={reset}
            enhancePrompt={enhancePrompt}
            workerReady={workerReady}
          />
        );
      default:
        return <PlaceholderContent />;
    }
  };

  return (
    <div className="workflow-panel">
      <Stepper currentStep={currentStep} />
      <div className="workflow-content">
        {renderStep()}
      </div>
    </div>
  );
}
