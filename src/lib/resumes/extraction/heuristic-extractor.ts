import type {
  ExtractedResumeProfile,
  FieldConfidenceMap,
  ResumeExtractionResult,
  ResumeExtractor,
  ResumeExtractorContext,
} from "@/lib/resumes/extraction/types";

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b/g;

function firstMatch(text: string, pattern: RegExp): string | undefined {
  const match = text.match(pattern);
  return match?.[0]?.trim();
}

function extractSkills(text: string): string[] {
  const skillsSection = text.match(
    /skills[:\s-]+([\s\S]{0,800})/i,
  )?.[1];
  if (!skillsSection) {
    return [];
  }
  return skillsSection
    .split(/[,|•\n;]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 60)
    .slice(0, 20);
}

function extractNameFromFirstLine(text: string): string | undefined {
  const firstLine = text.split(/\n|\. /)[0]?.trim() ?? "";
  if (!firstLine || firstLine.length > 80) {
    return undefined;
  }
  if (EMAIL_RE.test(firstLine) || PHONE_RE.test(firstLine)) {
    return undefined;
  }
  const words = firstLine.split(/\s+/);
  if (words.length < 2 || words.length > 5) {
    return undefined;
  }
  if (!words.every((word) => /^[A-Za-z.'-]+$/.test(word))) {
    return undefined;
  }
  return firstLine;
}

function extractYearsExperience(text: string): number | undefined {
  const match = text.match(/(\d{1,2})\+?\s*(?:years|yrs)(?:\s+of)?\s+experience/i);
  if (!match) {
    return undefined;
  }
  const years = Number.parseInt(match[1] ?? "", 10);
  return Number.isFinite(years) ? years : undefined;
}

export class HeuristicResumeExtractor implements ResumeExtractor {
  readonly id = "heuristic";

  async extractStructuredProfile(
    context: ResumeExtractorContext,
  ): Promise<ResumeExtractionResult> {
    const text = context.normalizedText;
    const data: ExtractedResumeProfile = {};
    const confidence: FieldConfidenceMap = {};
    const needsReview: (keyof ExtractedResumeProfile)[] = [];

    const email = firstMatch(text, EMAIL_RE);
    if (email) {
      data.email = email.toLowerCase();
      confidence.email = 0.95;
    }

    const phone = firstMatch(text, PHONE_RE);
    if (phone) {
      data.phone = phone;
      confidence.phone = 0.75;
      needsReview.push("phone");
    }

    const name = extractNameFromFirstLine(text);
    if (name) {
      data.full_name = name;
      confidence.full_name = 0.55;
      needsReview.push("full_name");
    }

    const headlineMatch = text.match(
      /(?:^|\n)([A-Z][A-Za-z0-9/&,\s-]{8,70})\n(?=[^\n]{0,120}(experience|skills|education))/m,
    );
    if (headlineMatch?.[1]) {
      data.headline = headlineMatch[1].trim();
      confidence.headline = 0.45;
      needsReview.push("headline");
    }

    const locationMatch = text.match(
      /\b([A-Za-z .'-]+,\s*(?:India|[A-Z]{2}))\b/,
    );
    if (locationMatch?.[1]) {
      data.location = locationMatch[1].trim();
      confidence.location = 0.4;
      needsReview.push("location");
    }

    const summaryMatch = text.match(
      /(?:summary|profile|about)[:\s-]+([\s\S]{40,600}?)(?:\n(?:experience|skills|education)\b|$)/i,
    );
    if (summaryMatch?.[1]) {
      data.professional_summary = summaryMatch[1].trim();
      confidence.professional_summary = 0.5;
      needsReview.push("professional_summary");
    }

    const skills = extractSkills(text);
    if (skills.length) {
      data.skills = skills;
      confidence.skills = 0.55;
      needsReview.push("skills");
    }

    const years = extractYearsExperience(text);
    if (years !== undefined) {
      data.total_experience_years = years;
      confidence.total_experience_years = 0.5;
      needsReview.push("total_experience_years");
    }

    const preferred = text.match(
      /preferred locations?[:\s-]+([^\n]+)/i,
    )?.[1];
    if (preferred) {
      data.preferred_locations = preferred
        .split(/[,|]/)
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 10);
      if (data.preferred_locations.length) {
        confidence.preferred_locations = 0.45;
        needsReview.push("preferred_locations");
      }
    }

    const hasAny = Object.keys(data).length > 0;
    if (!hasAny) {
      return {
        ok: false,
        category: "insufficient_text",
        message: "Not enough structured information could be inferred.",
      };
    }

    return { ok: true, data, confidence, needsReview };
  }
}
