# Resume processing environment

Set these in the server environment (never expose to the browser).

## Default (free)

| Variable | Value | Purpose |
| --- | --- | --- |
| `RESUME_EXTRACTION_PROVIDER` | `heuristic` | Built-in PDF/DOCX text + rule-based suggestions. **No API cost.** |

If unset in code, the app also defaults to `heuristic`. Set explicitly on Vercel/production so behavior is obvious.

Image resumes (JPEG/PNG) and scanned PDFs need OCR only when you opt in below. Until then, uploads still work; suggestions may be limited with a clear message.

## Optional (paid OpenAI Platform API)

A **ChatGPT Plus/Pro subscription does not include OpenAI API usage.** API keys and billing are separate at [platform.openai.com](https://platform.openai.com).

| Variable | Purpose |
| --- | --- |
| `RESUME_EXTRACTION_PROVIDER=openai` | LLM-based structured extraction |
| `OPENAI_API_KEY` | Required for `openai` provider and OCR |
| `RESUME_EXTRACTION_MODEL` | Optional structuring model (default `gpt-4o-mini`) |
| `RESUME_OCR_PROVIDER=openai` | Image / low-text PDF OCR via vision API |
| `RESUME_OCR_MODEL` | Optional OCR model (default `gpt-4o-mini`) |

Set `RESUME_EXTRACTION_PROVIDER=off` to disable automatic suggestions entirely (upload still works).

Supabase service role credentials remain server-only for account administration.

Migration: `20260803220000_resume_parsing.sql`
