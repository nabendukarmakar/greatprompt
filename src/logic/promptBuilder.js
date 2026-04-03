export function buildPrompt({ intent, domain, answers, transcript, context }) {
  const audience = answers.audience || 'a professional audience';
  const tone     = answers.tone     || 'clear and professional';
  const format   = answers.format   || 'well-structured';
  const ds       = answers.ds       ? `\nSpecific constraint: ${answers.ds}` : '';
  const ctx      = context          ? `\n\nAdditional context: ${context}` : '';

  return `You are an expert in ${domain}. Your task is to ${intent.toLowerCase().replace(/\.$/, '')}.

Target audience: ${audience}
Tone & style: ${tone}
Output format: ${format}${ds}

Original request: "${transcript}"${ctx}

Provide a thorough, high-quality response. Structure clearly, ensure accuracy, and tailor depth and language to the specified audience and tone. State any assumptions briefly at the start.`;
}
