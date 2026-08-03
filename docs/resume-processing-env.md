# Resume processing environment

Set these in the server environment (never expose to the browser).

## Default (free)

| Variable | Value | Purpose |
| --- | --- | --- |
| `RESUME_EXTRACTION_PROVIDER` | `heuristic` | Built-in PDF/DOCX text + rule-based suggestions. **No API cost.** |

If unset in code, the app also defaults to `heuristic`. Set explicitly on Vercel/production so behavior is obvious.

Uploads are limited to PDF and DOCX files up to 10 MB. Legacy DOC and image files are rejected.

## Optional (paid OpenAI Platform API)

A **ChatGPT Plus/Pro subscription does not include OpenAI API usage.** API keys and billing are separate at [platform.openai.com](https://platform.openai.com).

| Variable | Purpose |
| --- | --- |
| `RESUME_EXTRACTION_PROVIDER=openai` | LLM-based structured extraction |
| `OPENAI_API_KEY` | Required only for the optional `openai` structuring provider |
| `RESUME_EXTRACTION_MODEL` | Optional structuring model (default `gpt-4o-mini`) |

Set `RESUME_EXTRACTION_PROVIDER=off` to disable automatic suggestions entirely (upload still works).

Supabase service role credentials remain server-only for account administration.

Migrations: `20260803220000_resume_parsing.sql`, `20260803230000_restrict_resume_formats.sql`
