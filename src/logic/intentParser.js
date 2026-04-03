export function extractIntent(transcript) {
  const verbs = ['create','build','write','generate','analyze','design',
                 'make','develop','summarize','explain','convert','compare'];
  const lower = transcript.toLowerCase();
  for (const v of verbs) {
    const i = lower.indexOf(v);
    if (i !== -1) {
      return transcript.slice(i, i + 80).trim() + (transcript.length > i + 80 ? '…' : '');
    }
  }
  return transcript.slice(0, 100) + (transcript.length > 100 ? '…' : '');
}
