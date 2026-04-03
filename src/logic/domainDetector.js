const DOMAINS = {
  'Code / Engineering':  ['code','script','function','api','python','javascript','sql','database','algorithm'],
  'Data & Analytics':    ['data','csv','report','chart','dashboard','analysis','visualization','metrics'],
  'Writing & Content':   ['write','article','blog','essay','email','letter','summary','draft','story'],
  'Research & Learning': ['explain','research','learn','understand','compare','how does','what is'],
  'Design & UX':         ['design','ui','ux','wireframe','layout','component','interface','mockup'],
  'Business & Strategy': ['business','strategy','plan','proposal','market','customer','pitch','roi'],
};

export function detectDomains(transcript) {
  const lower = transcript.toLowerCase();
  const results = Object.entries(DOMAINS)
    .map(([label, kw]) => ({ label, score: kw.filter(k => lower.includes(k)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // If all scores are zero, add General / Other
  if (results.every(r => r.score === 0)) {
    results[results.length - 1] = { label: 'General / Other', score: 0 };
  }

  return results;
}
