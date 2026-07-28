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
import {
  MARIE_CORE_CONCLUSIONS,
  MARIE_OPTIONAL_EVIDENCE,
  MARIE_RECONSTRUCTION_CARDS,
} from "./marieCase";
import {
  JORGEN_CORE_CONCLUSIONS,
  JORGEN_OPTIONAL_EVIDENCE,
  JORGEN_RECONSTRUCTION_CARDS,
} from "./jorgenCase";

export type DirectorsCutCaseId = Exclude<CaseId, "laura">;

export interface DirectorsCutCaseContent {
  caseId: DirectorsCutCaseId;
  finaleKind: "npc-confession" | "special-revelation";
  coreConclusions: readonly KnowledgeId[];
  optionalEvidence: readonly KnowledgeId[];
  reconstructionCards: readonly string[];
  finaleKnowledgeId: KnowledgeId;
  reconstructionKnowledgeId: KnowledgeId;
  preventionPlanKnowledgeId: KnowledgeId;
  hiddenKnowledge?: readonly KnowledgeId[];
  startLead: string;
  finalLead: string;
  epilogue: readonly string[];
  reconstructionAssetId: string;
  epilogueAssetId: string;
  result?: {
    murdererLabel?: string;
    topRating?: string;
    extraStatistics?: readonly {
      label: string;
      value: string;
    }[];
  };
}

export const DIRECTORS_CUT_CASE_CONTENT: Readonly<
  Record<DirectorsCutCaseId, DirectorsCutCaseContent>
> = {
  david: {
    caseId: "david",
    finaleKind: "npc-confession",
    coreConclusions: DAVID_CORE_CONCLUSIONS,
    optionalEvidence: DAVID_OPTIONAL_EVIDENCE,
    reconstructionCards: DAVID_RECONSTRUCTION_CARDS,
    finaleKnowledgeId: "david_confessed",
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
    finaleKind: "npc-confession",
    coreConclusions: BARBARA_CORE_CONCLUSIONS,
    optionalEvidence: BARBARA_OPTIONAL_EVIDENCE,
    reconstructionCards: BARBARA_RECONSTRUCTION_CARDS,
    finaleKnowledgeId: "barbara_confessed",
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
  marie: {
    caseId: "marie",
    finaleKind: "npc-confession",
    coreConclusions: MARIE_CORE_CONCLUSIONS,
    optionalEvidence: MARIE_OPTIONAL_EVIDENCE,
    reconstructionCards: MARIE_RECONSTRUCTION_CARDS,
    finaleKnowledgeId: "marie_confessed",
    reconstructionKnowledgeId: "marie_reconstruction_recorded",
    preventionPlanKnowledgeId: "marie_prevention_plan",
    startLead:
      "Find ud af, hvad Ryan truede Marie med, og hvor meget af rapporten der faktisk er hendes arbejde.",
    finalLead:
      "Sikr Maries arbejde i grupperummet, og stands derefter mødet ved passagen.",
    epilogue: [
      "Ryan overlevede. Maries tidsstemplede sider og gruppens vidner gjorde det umuligt for ham at udslette hendes bidrag.",
      "Marie fulgte ikke Ryan ind i passagen. Laura blev ikke udstillet som led i hans trussel, og Marie stod ikke længere alene med ham.",
      "Stormen lagde sig i løbet af aftenen.",
      "Næste morgen vågnede Jørgen til en ny dag. For første gang gentog gårsdagen sig ikke.",
    ],
    reconstructionAssetId: "dc-marie-reconstruction-sequence",
    epilogueAssetId: "dc-marie-epilogue-sequence",
  },
  jorgen: {
    caseId: "jorgen",
    finaleKind: "special-revelation",
    coreConclusions: JORGEN_CORE_CONCLUSIONS,
    optionalEvidence: JORGEN_OPTIONAL_EVIDENCE,
    reconstructionCards: JORGEN_RECONSTRUCTION_CARDS,
    finaleKnowledgeId: "jorgen_revelation_completed",
    reconstructionKnowledgeId: "jorgen_reconstruction_recorded",
    preventionPlanKnowledgeId: "jorgen_prevention_plan",
    hiddenKnowledge: ["jorgen_prior_loop_reference_ready"],
    startLead:
      "Gennemlev dagen, og læg mærke til, om nogen kan kende mine valg fra et tidligere loop.",
    finalLead:
      "Placér en falsk plan, og nå afsatsen ad en rute min senere udgave ikke forventer.",
    epilogue: [
      "Ryan overlevede. Den senere Jørgen nåede aldrig at fuldføre det skub, der skulle skabe hans egen fortid.",
      "Siden fra fremtiden blev blank. Den ældre Jørgens stemme forsvandt midt i en sætning, og til sidst var der kun én Jørgen tilbage.",
      "De andre huskede kun den endelige dag. Jørgen huskede mordet, efterforskningen og den person, han kunne være blevet.",
      "Næste morgen fortsatte tiden fremad.",
    ],
    reconstructionAssetId: "dc-jorgen-reconstruction-sequence",
    epilogueAssetId: "dc-jorgen-epilogue-sequence",
    result: {
      murdererLabel: "Jørgen (senere)",
      topRating: "Kronologisk umulig",
      extraStatistics: [
        { label: "Registrerede Jørgener", value: "2" },
        { label: "Tidsmæssige selvmodsigelser", value: "1" },
      ],
    },
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
