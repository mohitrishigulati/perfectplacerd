const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const INJECTION_PATTERNS = [
  /\bignore (all )?(previous|prior) instructions\b/gi,
  /\bsystem prompt\b/gi,
  /\byou are now\b/gi,
  /\bassistant:\b/gi,
];

export function normalizeResumeText(raw: string): string {
  const withoutControls = raw.replace(CONTROL_CHARS, " ");
  const collapsed = withoutControls.replace(/\s+/g, " ").trim();
  return collapsed.slice(0, 120_000);
}

export function sanitizeResumeTextForModel(raw: string): string {
  let text = normalizeResumeText(raw);
  for (const pattern of INJECTION_PATTERNS) {
    text = text.replace(pattern, "[filtered]");
  }
  return text;
}

export function isTextSufficientForStructuring(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  return letters.length >= 40;
}
