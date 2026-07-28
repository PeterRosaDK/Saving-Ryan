import type { CaseId, KnowledgeId } from "../app/types";
import {
  BARBARA_CORE_CONCLUSIONS,
  BARBARA_OPTIONAL_EVIDENCE,
  BARBARA_RECONSTRUCTION_CARDS,
} from "./barbaraCase";
import {
  DAVID_CORE_CONCLUSIONS,
  DAVID_OPTIONAL_EVIDENCE,
  DAVID_RECONSTRUCTION_CARDS,
} from "./davidCase";

export type DirectorsCutCaseId = Exclude<CaseId, "laura">;

export interface DirectorsCutCaseContent {
  caseId: DirectorsCutCaseId;
  coreConclusions: readonly KnowledgeId[];
  optionalEvidence: readonly KnowledgeId[];
  reconstructionCards: readonly string[];
  confessionKnowledgeId: KnowledgeId;
  reconstructionKnowledgeId: KnowledgeId;
  preventionPlanKnowledgeId: KnowledgeId;
  startLead: string;
  finalLead: string;
  epilogue: readonly string[];
  reconstructionAssetId: string;
  epilogueAssetId: string;
}

export const DIRECTORS_CUT_CASE_CONTENT: Readonly<
  Record<DirectorsCutCaseId, DirectorsCutCaseContent>
> = {
  david: {
    caseId: "david",
    coreConclusions: DAVID_CORE_CONCLUSIONS,
    optionalEvidence: DAVID_OPTIONAL_EVIDENCE,
    reconstructionCards: DAVID_RECONSTRUCTION_CARDS,
    confessionKnowledgeId: "david_confessed",
    reconstructionKnowledgeId: "david_reconstruction_recorded",
    preventionPlanKnowledgeId: "david_prevention_plan",
    startLead: "Find ud af, hvilke konflikter Ryan har skabt i gruppen.",
    finalLead: "Vær i læsesalen ved middag og stop David.",
    epilogue: [
      "Ryan overlevede. Gruppen tilkaldte hjælp, og David blev fjernet fra situationen, før nogen kom til skade.",
      "Stormen lagde sig i løbet af aftenen.",
      "Næste morgen vågnede Jørgen til en ny dag. For første gang gentog gårsdagen sig ikke.",
    ],
    reconstructionAssetId: "dc-david-reconstruction-sequence",
    epilogueAssetId: "dc-david-epilogue-sequence",
  },
  barbara: {
    caseId: "barbara",
    coreConclusions: BARBARA_CORE_CONCLUSIONS,
    optionalEvidence: BARBARA_OPTIONAL_EVIDENCE,
    reconstructionCards: BARBARA_RECONSTRUCTION_CARDS,
    confessionKnowledgeId: "barbara_confessed",
    reconstructionKnowledgeId: "barbara_reconstruction_recorded",
    preventionPlanKnowledgeId: "barbara_prevention_plan",
    startLead: "Undersøg Ryans konflikter med gruppen.",
    finalLead: "Vær i læsesalen ved middag og vent ved bogreolen.",
    epilogue: [
      "Ryan overlevede. Barbara blev standset med den stjålne halskæde i hånden og måtte forklare både bygningstegningerne, de manipulerede karakterer og forsøget på at lokke Ryan ud på afsatsen.",
      "Lauras private oplysninger blev renset for enhver forbindelse til mordet. Hun havde været udset som syndebuk, ikke afsløret som gerningsmand.",
      "Stormen lagde sig i løbet af aftenen.",
      "Næste morgen vågnede Jørgen til en ny dag. For første gang gentog gårsdagen sig ikke.",
    ],
    reconstructionAssetId: "dc-barbara-reconstruction-sequence",
    epilogueAssetId: "dc-barbara-epilogue-sequence",
  },
};

export function isDirectorsCutCaseId(
  caseId: CaseId,
): caseId is DirectorsCutCaseId {
  return caseId !== "laura";
}

export function getDirectorsCutCaseContent(
  caseId: DirectorsCutCaseId,
): DirectorsCutCaseContent {
  return DIRECTORS_CUT_CASE_CONTENT[caseId];
}
