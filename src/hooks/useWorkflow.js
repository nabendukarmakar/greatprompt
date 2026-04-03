import { useState, useCallback } from 'react';

const INITIAL_STATE = {
  currentStep: 0,
  intent: '',
  domain: '',
  answers: {},
  context: '',
  finalPrompt: '',
};

export function useWorkflow() {
  const [workflowState, setWorkflowState] = useState(INITIAL_STATE);

  const goToStep = useCallback((n) => {
    setWorkflowState(prev => {
      // Don't skip more than one step forward
      if (n > prev.currentStep + 1) return prev;
      return { ...prev, currentStep: n };
    });
  }, []);

  const updateState = useCallback((patch) => {
    setWorkflowState(prev => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setWorkflowState(INITIAL_STATE);
  }, []);

  return { workflowState, goToStep, updateState, reset };
}
