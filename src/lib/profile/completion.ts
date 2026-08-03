import type { ProfileFormValues } from "@/lib/validations/profile";

export type ProfileCompletionInput = {
  full_name?: string | null;
  phone?: string | null;
  headline?: string | null;
  location?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  preferences?: ProfileFormValues["preferences"] | null;
  hasPrimaryResume?: boolean;
};

export type ProfileCompletionResult = {
  percent: number;
  completedCount: number;
  totalCount: number;
  items: Array<{
    id: string;
    label: string;
    complete: boolean;
    weight: number;
  }>;
};

const ITEMS: Array<{
  id: string;
  label: string;
  weight: number;
  isComplete: (input: ProfileCompletionInput) => boolean;
}> = [
  {
    id: "full_name",
    label: "Full name",
    weight: 15,
    isComplete: (i) => Boolean(i.full_name?.trim()),
  },
  {
    id: "headline",
    label: "Professional headline",
    weight: 10,
    isComplete: (i) => Boolean(i.headline?.trim()),
  },
  {
    id: "location",
    label: "Location",
    weight: 10,
    isComplete: (i) => Boolean(i.location?.trim()),
  },
  {
    id: "phone",
    label: "Phone number",
    weight: 10,
    isComplete: (i) => Boolean(i.phone?.trim()),
  },
  {
    id: "bio",
    label: "About you",
    weight: 10,
    isComplete: (i) => Boolean(i.bio?.trim() && i.bio.trim().length >= 40),
  },
  {
    id: "skills",
    label: "At least 3 skills",
    weight: 15,
    isComplete: (i) => (i.skills?.filter(Boolean).length ?? 0) >= 3,
  },
  {
    id: "preferences",
    label: "Job preferences",
    weight: 15,
    isComplete: (i) => {
      const p = i.preferences;
      if (!p) return false;
      const hasRemote = Boolean(p.remote);
      const hasTypes = (p.employmentTypes?.length ?? 0) > 0;
      const hasLocations = (p.preferredLocations?.length ?? 0) > 0;
      return hasRemote && (hasTypes || hasLocations);
    },
  },
  {
    id: "resume",
    label: "Primary resume uploaded",
    weight: 15,
    isComplete: (i) => Boolean(i.hasPrimaryResume),
  },
];

export function calculateProfileCompletion(
  input: ProfileCompletionInput,
): ProfileCompletionResult {
  const items = ITEMS.map(({ id, label, weight, isComplete }) => ({
    id,
    label,
    weight,
    complete: isComplete(input),
  }));

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const earned = items
    .filter((item) => item.complete)
    .reduce((sum, item) => sum + item.weight, 0);

  const percent =
    totalWeight === 0 ? 0 : Math.round((earned / totalWeight) * 100);

  return {
    percent,
    completedCount: items.filter((i) => i.complete).length,
    totalCount: items.length,
    items,
  };
}
