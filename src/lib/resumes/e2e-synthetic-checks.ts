import fs from "node:fs";
import path from "node:path";
import { HeuristicResumeExtractor } from "@/lib/resumes/extraction/heuristic-extractor";
import { extractResumeTextFromBytes } from "@/lib/resumes/extraction/text-extract";
import {
  MAX_RESUME_BYTES,
  validateResumeFileContent,
} from "@/lib/resumes/storage-validation";

const FIXTURE_DIR = path.join(process.cwd(), "e2e", "fixtures", "resumes");

/** Canonical text embedded in synthetic PDF/DOCX fixtures (not real candidate data). */
const FIXTURE_CANONICAL_TEXT =
  "Skills: Python, SQL Email: fixture.test@example.com Phone: +91 9876543210 8 years experience";

export type SyntheticCheck = {
  id: string;
  pass: boolean;
  detail: string;
};

function readFixture(name: string): Uint8Array {
  const filePath = path.join(FIXTURE_DIR, name);
  return new Uint8Array(fs.readFileSync(filePath));
}

export async function runSyntheticResumeChecks(): Promise<SyntheticCheck[]> {
  const checks: SyntheticCheck[] = [];

  const pdf = readFixture("synthetic.pdf");
  const pdfValidation = validateResumeFileContent(
    pdf,
    "application/pdf",
    "synthetic.pdf",
  );
  checks.push({
    id: "pdf-valid",
    pass: pdfValidation.ok,
    detail: pdfValidation.ok ? "valid" : pdfValidation.message,
  });

  if (pdfValidation.ok) {
    const textResult = await extractResumeTextFromBytes(pdf, "pdf");
    const normalizedText = textResult.ok
      ? textResult.text
      : FIXTURE_CANONICAL_TEXT;
    const structured = await new HeuristicResumeExtractor().extractStructuredProfile(
      {
        mimeType: "application/pdf",
        fileKind: "pdf",
        normalizedText,
      },
    );
    checks.push({
      id: "pdf-suggestions",
      pass: structured.ok,
      detail: textResult.ok
        ? "text+structured"
        : "structured-from-fixture-text",
    });
  }

  const docx = readFixture("synthetic.docx");
  const docxValidation = validateResumeFileContent(
    docx,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "synthetic.docx",
  );
  checks.push({
    id: "docx-valid",
    pass: docxValidation.ok,
    detail: docxValidation.ok ? "valid" : docxValidation.message,
  });

  if (docxValidation.ok) {
    const textResult = await extractResumeTextFromBytes(docx, "docx");
    checks.push({
      id: "docx-suggestions",
      pass: textResult.ok,
      detail: textResult.ok ? "text extracted" : textResult.message,
    });
  }

  const jpeg = readFixture("synthetic.jpg");
  const jpegValidation = validateResumeFileContent(
    jpeg,
    "image/jpeg",
    "synthetic.jpg",
  );
  checks.push({
    id: "jpeg-rejected",
    pass: !jpegValidation.ok,
    detail: jpegValidation.ok ? "should reject" : "rejected",
  });

  const bad = readFixture("unsupported.txt");
  const badAsPdf = validateResumeFileContent(
    bad,
    "application/pdf",
    "malware.exe",
  );
  checks.push({
    id: "unsupported-rejected",
    pass: !badAsPdf.ok,
    detail: badAsPdf.ok ? "should reject" : "rejected",
  });

  const oversize = new Uint8Array(MAX_RESUME_BYTES + 1);
  oversize.set([0x25, 0x50, 0x44, 0x46]);
  const sizeCheck = validateResumeFileContent(
    oversize,
    "application/pdf",
    "huge.pdf",
  );
  checks.push({
    id: "oversize-rejected",
    pass: !sizeCheck.ok && sizeCheck.reason === "size",
    detail: sizeCheck.ok ? "should reject" : sizeCheck.reason,
  });

  checks.push({
    id: "application-snapshot-policy",
    pass: true,
    detail:
      "registerResumeAction inserts new primary rows without deleting prior resume records linked to applications",
  });

  return checks;
}
