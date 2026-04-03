import { useState } from 'react';
import { getQuestions } from '../../logic/questionBank';
import { Button } from '../common/Button';

export function ClarifyStep({ workflowState, updateState, goToStep }) {
  const questions = getQuestions(workflowState.domain);
  const [answers, setAnswers] = useState(workflowState.answers || {});

  const handleOptionSelect = (questionId, value) => {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    updateState({ answers: next });
  };

  const handleTextChange = (questionId, value) => {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    updateState({ answers: next });
  };

  return (
    <div className="step-container">
      <h2 className="step-title">A few quick questions</h2>
      <p className="step-subtitle">Help us tailor your prompt. All answers are optional.</p>

      {questions.map((q, idx) => (
        <div key={q.id} className="question-block" style={{ animationDelay: `${idx * 0.05}s` }}>
          <div className="question-text">{q.text}</div>
          {q.type === 'options' ? (
            <div className="question-options">
              {q.options.map(opt => (
                <button
                  key={opt}
                  className={`option-chip${answers[q.id] === opt ? ' selected' : ''}`}
                  onClick={() => handleOptionSelect(q.id, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <input
              className="question-input"
              type="text"
              placeholder={q.placeholder || ''}
              value={answers[q.id] || ''}
              onChange={e => handleTextChange(q.id, e.target.value)}
            />
          )}
        </div>
      ))}

      <div style={{ marginTop: 8 }}>
        <Button variant="primary" onClick={() => goToStep(3)}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
