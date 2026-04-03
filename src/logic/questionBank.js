const UNIVERSAL = [
  {
    id: 'audience',
    text: 'Who is the intended audience?',
    type: 'options',
    options: ['Just me', 'My team', 'Clients / stakeholders', 'General public'],
  },
  {
    id: 'tone',
    text: 'What tone or style do you prefer?',
    type: 'options',
    options: ['Formal & professional', 'Conversational', 'Technical & precise', 'Creative'],
  },
  {
    id: 'format',
    text: 'What format should the output take?',
    type: 'options',
    options: ['Detailed explanation', 'Bullet points', 'Step-by-step guide', 'Short & concise'],
  },
];

const DOMAIN_SPECIFIC = {
  'Code / Engineering':  { id: 'ds', text: 'Which language or framework?', type: 'text', placeholder: 'e.g. Python 3.11, React 18…' },
  'Data & Analytics':    { id: 'ds', text: 'What data source?', type: 'text', placeholder: 'e.g. PostgreSQL, CSV, BigQuery…' },
  'Writing & Content':   { id: 'ds', text: 'Any length or structure in mind?', type: 'text', placeholder: 'e.g. 500 words, 3 sections…' },
  'Research & Learning': { id: 'ds', text: 'How deep should the explanation go?', type: 'options', options: ['High-level overview','Intermediate','Expert-level detail'] },
  'Business & Strategy': { id: 'ds', text: 'What decision are you driving toward?', type: 'text', placeholder: 'e.g. Board approval, client proposal…' },
  'Design & UX':         { id: 'ds', text: 'Design system or aesthetic?', type: 'text', placeholder: 'e.g. Material, dark theme, minimalist…' },
};

export function getQuestions(domain) {
  const ds = DOMAIN_SPECIFIC[domain];
  return ds ? [...UNIVERSAL, ds] : UNIVERSAL;
}
