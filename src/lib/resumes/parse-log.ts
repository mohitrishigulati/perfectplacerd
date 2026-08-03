export function logResumeParseEvent(input: {
  resumeId: string;
  userId: string;
  stage: string;
  category?: string;
  status?: string;
}) {
  console.info(
    JSON.stringify({
      event: "resume_parse",
      resumeId: input.resumeId,
      userId: input.userId,
      stage: input.stage,
      category: input.category ?? null,
      status: input.status ?? null,
    }),
  );
}
