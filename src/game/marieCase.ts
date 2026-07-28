import type { GameState, KnowledgeId } from "../app/types";

export const MARIE_CORE_CONCLUSIONS = [
  "marie_motive_conclusion",
  "marie_alibi_conclusion",
  "marie_passage_conclusion",
  "marie_physical_conclusion",
] as const satisfies readonly KnowledgeId[];

export const MARIE_OPTIONAL_EVIDENCE = [
  "ryan_claimed_marie_work",
  "marie_returned_dusty",
] as const satisfies readonly KnowledgeId[];

export const MARIE_RECONSTRUCTION_CARDS = [
  "Ryan havde i lang tid taget æren for Maries arbejde og gjort hende afhængig af hans godkendelse.",
  "Denne morgen ville han fjerne hendes navn og bruge Lauras fortid som våben.",
  "Efter ydmygelsen opdagede Marie tilfældigt den skjulte vej til afsatsen.",
  "Hun fulgte Ryan med den rettede side for at kræve sit arbejde tilbage.",
  "Ryan rev i papiret under skænderiet. Fragmentet blev i hans hånd.",
  "Marie skubbede ham i affekt og flygtede tilbage gennem passagen.",
  "Denne gang skal Ryan miste sit greb om hende, før hun følger efter ham.",
] as const;

export function hasAllMarieConclusions(
  state: Pick<GameState, "selectedCaseId" | "knowledge">,
): boolean {
  return (
    state.selectedCaseId === "marie" &&
    MARIE_CORE_CONCLUSIONS.every((id) => state.knowledge[id])
  );
}

export function getMissingMarieConclusionLabels(
  state: Pick<GameState, "knowledge">,
): string[] {
  const missing: string[] = [];
  if (!state.knowledge.marie_motive_conclusion) {
    missing.push("hvor alvorlig Ryans trussel var");
  }
  if (!state.knowledge.marie_alibi_conclusion) {
    missing.push("hullet i Maries alibi");
  }
  if (!state.knowledge.marie_physical_conclusion) {
    missing.push("den fysiske forbindelse til Ryan");
  }
  if (!state.knowledge.marie_passage_conclusion) {
    missing.push("hvordan hun kunne nå afsatsen");
  }
  return missing;
}

export function deriveMarieLead(
  state: Pick<GameState, "knowledge" | "caseProgress">,
): string {
  const knowledge = state.knowledge;
  if (knowledge.marie_confessed) {
    return knowledge.marie_work_secured
      ? "Vær i læsesalen ved middag og stands mødet på afsatsen."
      : "Sikr en tidsstemplet kopi af Maries arbejde i grupperummet.";
  }
  if (MARIE_CORE_CONCLUSIONS.every((id) => knowledge[id])) {
    return "Konfronter Marie med motivet, det brudte alibi, passagen og den iturevne side.";
  }
  if (
    knowledge.marie_fragment_in_ryan_hand &&
    !knowledge.marie_physical_conclusion
  ) {
    return "Sammenlign fragmentet med Maries papirer.";
  }
  if (
    knowledge.marie_physical_conclusion &&
    !knowledge.marie_passage_conclusion
  ) {
    return "Undersøg læsesalen for tegn på, at Marie kendte passagen.";
  }
  if (
    knowledge.marie_motive_conclusion &&
    !knowledge.marie_alibi_conclusion
  ) {
    return "Undersøg, hvor Marie befandt sig lige før skriget.";
  }
  if (
    knowledge.ryan_threatened_remove_marie_credit &&
    !knowledge.ryan_threatened_laura
  ) {
    return "Find ud af, hvad Ryan ellers truede Marie med.";
  }
  return state.caseProgress.currentLead;
}
