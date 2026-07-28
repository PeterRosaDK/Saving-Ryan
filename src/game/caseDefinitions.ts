import type {
  CaseId,
  CharacterId,
} from "../app/types";

export interface CaseDefinition {
  id: CaseId;
  selection: "default" | "mystery";
  murderer: CharacterId;
  menu: {
    title: string;
    description: string;
  };
}

export const DEFAULT_CASE_ID = "laura" satisfies CaseId;

export const CASE_DEFINITIONS: Readonly<
  Record<CaseId, CaseDefinition>
> = {
  laura: {
    id: "laura",
    selection: "default",
    murderer: "Laura",
    menu: {
      title: "Den oprindelige sag",
      description:
        "Gennemlev den restaurerede historie og find en vej ud af tidsløkken.",
    },
  },
};

export function getCaseDefinition(caseId: CaseId): CaseDefinition {
  return CASE_DEFINITIONS[caseId];
}

export function getMysteryCaseIds(): readonly CaseId[] {
  return Object.values(CASE_DEFINITIONS)
    .filter(({ selection }) => selection === "mystery")
    .map(({ id }) => id);
}

export function selectMysteryCaseId(
  randomValue = Math.random(),
): CaseId | null {
  const options = getMysteryCaseIds();
  if (options.length === 0) {
    return null;
  }

  const normalizedRandomValue = Math.min(
    Math.max(randomValue, 0),
    1 - Number.EPSILON,
  );
  return options[Math.floor(normalizedRandomValue * options.length)] ?? null;
}
