import type {
  CaseId,
  CharacterId,
} from "../app/types";
import {
  getDirectorsCutCaseContent,
  isDirectorsCutCaseId,
} from "./directorsCutCaseContent";

export interface CaseDefinition {
  id: CaseId;
  mode: "original" | "directors_cut";
  enabled: boolean;
  murderer: CharacterId;
  menu: {
    title: string;
    description: string;
  };
  score: {
    parDays: number;
    base: number;
    extraDayPenalty: number;
    wrongAccusationPenalty: number;
    prematureAccusationPenalty: number;
    optionalEvidenceBonus: number;
  };
}

export const DEFAULT_CASE_ID = "laura" satisfies CaseId;

export const CASE_DEFINITIONS: Readonly<
  Record<CaseId, CaseDefinition>
> = {
  laura: {
    id: "laura",
    mode: "original",
    enabled: true,
    murderer: "Laura",
    menu: {
      title: "Original historie",
      description:
        "Spil den oprindelige fortælling som et særskilt, kanonisk forløb.",
    },
    score: {
      parDays: 3,
      base: 1000,
      extraDayPenalty: 100,
      wrongAccusationPenalty: 100,
      prematureAccusationPenalty: 50,
      optionalEvidenceBonus: 25,
    },
  },
  david: {
    id: "david",
    mode: "directors_cut",
    enabled: true,
    murderer: "David",
    menu: {
      title: "Director’s Cut",
      description:
        "Spil en alternativ version, hvor morderen vælges tilfældigt blandt de tilgængelige Director’s Cut-sager.",
    },
    score: {
      parDays: 2,
      base: 1000,
      extraDayPenalty: 100,
      wrongAccusationPenalty: 100,
      prematureAccusationPenalty: 50,
      optionalEvidenceBonus: 25,
    },
  },
  barbara: {
    id: "barbara",
    mode: "directors_cut",
    enabled: true,
    murderer: "Barbara",
    menu: {
      title: "Director’s Cut",
      description:
        "Spil en alternativ version, hvor morderen vælges tilfældigt blandt de tilgængelige Director’s Cut-sager.",
    },
    score: {
      parDays: 3,
      base: 1000,
      extraDayPenalty: 100,
      wrongAccusationPenalty: 100,
      prematureAccusationPenalty: 50,
      optionalEvidenceBonus: 25,
    },
  },
  marie: {
    id: "marie",
    mode: "directors_cut",
    enabled: true,
    murderer: "Marie",
    menu: {
      title: "Director’s Cut",
      description:
        "Spil en alternativ version, hvor morderen vælges tilfældigt blandt de tilgængelige Director’s Cut-sager.",
    },
    score: {
      parDays: 2,
      base: 1000,
      extraDayPenalty: 100,
      wrongAccusationPenalty: 100,
      prematureAccusationPenalty: 50,
      optionalEvidenceBonus: 25,
    },
  },
};

export function getCaseDefinition(caseId: CaseId): CaseDefinition {
  return CASE_DEFINITIONS[caseId];
}

export function getMysteryCaseIds(): readonly CaseId[] {
  return Object.values(CASE_DEFINITIONS)
    .filter(({ mode, enabled }) => mode === "directors_cut" && enabled)
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

export interface DirectorsCutSelection {
  caseId: CaseId | null;
  source: "qa" | "random";
  requestedCaseId: string | null;
}

export interface DirectorsCutSelectionOptions {
  requestedCaseId?: string | null;
  randomValue?: number;
  warn?: (message: string) => void;
}

export function getDirectorsCutCaseOverride(
  search: string,
): string | null {
  const value = new URLSearchParams(search).get("dcCase")?.trim();
  return value ? value : null;
}

export function isDirectorsCutQaMenuEnabled(search: string): boolean {
  return new URLSearchParams(search).get("qa")?.trim() === "1";
}

export function selectDirectorsCutCase({
  requestedCaseId = null,
  randomValue = Math.random(),
  warn = console.warn,
}: DirectorsCutSelectionOptions = {}): DirectorsCutSelection {
  const activeCaseIds = getMysteryCaseIds();
  const normalizedRequest = requestedCaseId?.trim() || null;

  if (
    normalizedRequest &&
    activeCaseIds.some((caseId) => caseId === normalizedRequest)
  ) {
    return {
      caseId: normalizedRequest as CaseId,
      source: "qa",
      requestedCaseId: normalizedRequest,
    };
  }

  if (normalizedRequest) {
    warn(
      `[Saving Ryan QA] Ukendt eller inaktiv Director’s Cut-case "${normalizedRequest}". Bruger normal registry-udvælgelse.`,
    );
  }

  return {
    caseId: selectMysteryCaseId(randomValue),
    source: "random",
    requestedCaseId: normalizedRequest,
  };
}

export function calculateCaseScore(state: {
  selectedCaseId: CaseId;
  loop: number;
  caseProgress: {
    statistics: {
      wrongAccusations: number;
      prematureAccusations: number;
    };
  };
  knowledge: Record<string, boolean>;
}): number {
  const score = getCaseDefinition(state.selectedCaseId).score;
  const optionalEvidence = isDirectorsCutCaseId(
    state.selectedCaseId,
  )
    ? getDirectorsCutCaseContent(
        state.selectedCaseId,
      ).optionalEvidence.filter((id) => state.knowledge[id]).length
    : 0;
  return Math.max(
    0,
    score.base -
      Math.max(0, state.loop - score.parDays) * score.extraDayPenalty -
      state.caseProgress.statistics.wrongAccusations *
        score.wrongAccusationPenalty -
      state.caseProgress.statistics.prematureAccusations *
        score.prematureAccusationPenalty +
      optionalEvidence * score.optionalEvidenceBonus,
  );
}
