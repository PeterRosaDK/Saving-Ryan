import type { GameState, KnowledgeId } from "../app/types";

export const BARBARA_CORE_CONCLUSIONS = [
  "barbara_motive_conclusion",
  "barbara_opportunity_conclusion",
  "barbara_passage_conclusion",
  "barbara_staging_conclusion",
] as const satisfies readonly KnowledgeId[];

export const BARBARA_OPTIONAL_EVIDENCE = [
  "marie_saw_barbara_by_bag",
  "david_saw_barbara_lead_ryan",
] as const satisfies readonly KnowledgeId[];

export const BARBARA_RECONSTRUCTION_CARDS = [
  "Nu forstår jeg motivet. Ryan afpressede Barbara med karaktersvindlen og kunne ødelægge hendes fremtid.",
  "Barbara fandt den skjulte passage i universitetets gamle bygningstegninger.",
  "Hun kendte billedet af Laura med isbjørnehalskæden, stjal selve halskæden fra Lauras taske og valgte Laura som syndebuk.",
  "Barbara førte Ryan gennem passagen, gav ham halskæden og skubbede ham, mens han råbte ned til mig.",
  "Bagefter lod hun, som om hun hjalp efterforskningen. I virkeligheden viste hun mig det spor, hun selv havde plantet.",
  "Denne gang skal jeg vente ved bogreolen i læsesalen. Jeg må gribe hende, før hun skubber Ryan.",
] as const;

export function hasAllBarbaraConclusions(
  state: Pick<GameState, "selectedCaseId" | "knowledge">,
): boolean {
  return (
    state.selectedCaseId === "barbara" &&
    BARBARA_CORE_CONCLUSIONS.every((id) => state.knowledge[id])
  );
}

export function getMissingBarbaraConclusionLabels(
  state: Pick<GameState, "knowledge">,
): string[] {
  const missing: string[] = [];
  if (!state.knowledge.barbara_motive_conclusion) missing.push("motivet");
  if (!state.knowledge.barbara_opportunity_conclusion) {
    missing.push("Barbaras bevægelser sammen med Ryan");
  }
  if (!state.knowledge.barbara_passage_conclusion) {
    missing.push("hendes forhåndskendskab til passagen");
  }
  if (!state.knowledge.barbara_staging_conclusion) {
    missing.push("det iscenesatte Laura-spor");
  }
  return missing;
}

export function deriveBarbaraLead(
  state: Pick<GameState, "knowledge" | "caseProgress">,
): string {
  const knowledge = state.knowledge;
  if (knowledge.barbara_confessed) {
    return "Vær i læsesalen ved middag og vent ved bogreolen.";
  }
  if (BARBARA_CORE_CONCLUSIONS.every((id) => knowledge[id])) {
    return "Jeg har hele sagen. Nu må jeg konfrontere Barbara efter mordet.";
  }
  if (
    knowledge.barbara_presented_image_as_new &&
    !knowledge.barbara_timestamps_compared
  ) {
    return "Kontrollér, hvornår Barbara første gang åbnede billedet.";
  }
  if (
    knowledge.necklace_found_in_ryans_hand &&
    !knowledge.barbara_staging_conclusion
  ) {
    return "Find ud af, hvem der kunne have taget halskæden før mordet.";
  }
  if (
    knowledge.laura_put_necklace_in_bag &&
    !knowledge.necklace_missing_from_laura_bag
  ) {
    return "Spørg Laura, om halskæden stadig ligger i tasken.";
  }
  if (
    knowledge.barbara_opened_plans_before_murder &&
    !knowledge.building_plans_show_passage
  ) {
    return "Find ud af, hvad tegningen og halskædebilledet viser.";
  }
  if (
    knowledge.barbara_hacker_alias_intruder &&
    !knowledge.barbara_forged_grades
  ) {
    return "Log ind på Barbaras computer.";
  }
  if (
    knowledge.barbara_forged_grades &&
    !knowledge.barbara_blackmailed_by_ryan
  ) {
    return "Find ud af, om Ryan kendte hendes hemmelighed.";
  }
  if (
    knowledge.barbara_is_computer_expert &&
    !knowledge.barbara_hacker_alias_intruder
  ) {
    return "Find ud af, hvem der kender Barbaras adgang til systemerne.";
  }
  return state.caseProgress.currentLead;
}
