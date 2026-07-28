import type { GameState, KnowledgeId } from "../app/types";

export const DAVID_CORE_CONCLUSIONS = [
  "david_motive_conclusion",
  "david_necklace_possession_conclusion",
  "david_opportunity_conclusion",
] as const satisfies readonly KnowledgeId[];

export const DAVID_OPTIONAL_EVIDENCE = [
  "marie_says_david_was_hurt",
  "david_lied_about_ryan",
] as const satisfies readonly KnowledgeId[];

export const DAVID_RECONSTRUCTION_CARDS = [
  "Nu forstår jeg motivet. Sarah forlod David for Ryan, og Ryan blev ved med at håne ham.",
  "Laura tabte sin halskæde i gangen. David samlede den op. Derfor endte den i Ryans hånd.",
  "Ryan fandt passagen i læsesalen. David fulgte ham ind få minutter før mordet.",
  "På afsatsen mistede David kontrollen og skubbede Ryan. Ryan rev kæden fra hans lomme, mens han faldt.",
  "Denne gang skal jeg være i læsesalen ved middag. Jeg må standse David, før han følger Ryan gennem døren.",
] as const;

export function hasAllDavidConclusions(
  state: Pick<GameState, "selectedCaseId" | "knowledge">,
): boolean {
  return (
    state.selectedCaseId === "david" &&
    DAVID_CORE_CONCLUSIONS.every((id) => state.knowledge[id])
  );
}

export function getMissingDavidConclusionLabels(
  state: Pick<GameState, "knowledge">,
): string[] {
  const missing: string[] = [];
  if (!state.knowledge.david_motive_conclusion) missing.push("motivet");
  if (!state.knowledge.david_necklace_possession_conclusion) {
    missing.push("forbindelsen mellem David og halskæden");
  }
  if (!state.knowledge.david_opportunity_conclusion) {
    missing.push("Davids bevægelser før mordet");
  }
  return missing;
}

export function deriveDavidLead(
  state: Pick<GameState, "knowledge" | "caseProgress">,
): string {
  const knowledge = state.knowledge;
  if (knowledge.david_confessed) {
    return "Vær i læsesalen ved middag og stop David.";
  }
  if (DAVID_CORE_CONCLUSIONS.every((id) => knowledge[id])) {
    return "Jeg har næsten hele sagen. Nu må jeg konfrontere David efter mordet.";
  }
  if (
    knowledge.laura_owns_polar_bear_necklace &&
    !knowledge.david_picked_up_necklace
  ) {
    return "Se nærmere på, hvad der sker i gangen før middag.";
  }
  if (
    knowledge.necklace_found_in_ryans_hand &&
    !knowledge.david_necklace_possession_conclusion
  ) {
    return "Find ud af, hvem der havde halskæden før mordet.";
  }
  if (
    knowledge.ryan_has_girlfriend_sarah &&
    !knowledge.sarah_left_david_for_ryan
  ) {
    return "Spørg ind til Sarah og David.";
  }
  if (
    knowledge.david_picked_up_necklace &&
    !knowledge.necklace_found_in_ryans_hand
  ) {
    return "Undersøg halskædens betydning, når gerningsstedet bliver tilgængeligt.";
  }
  if (
    knowledge.david_necklace_possession_conclusion &&
    !knowledge.david_motive_conclusion
  ) {
    return "Find ud af, hvilken personlig konflikt der bandt David og Ryan sammen.";
  }
  if (
    !knowledge.david_opportunity_conclusion &&
    knowledge.ryan_was_murdered
  ) {
    return "Overvær læsesalen ved middag og fastslå bevægelserne før mordet.";
  }
  return state.caseProgress.currentLead;
}
