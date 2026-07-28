import type { GameState, KnowledgeId } from "../app/types";

export const RYAN_CORE_CONCLUSIONS = [
  "ryan_physical_action_open_conclusion",
  "ryan_silencing_motive_conclusion",
  "ryan_arranged_ledge_meeting_conclusion",
  "ryan_false_suicide_plan_conclusion",
  "ryan_self_defense_conclusion",
  "ryan_responsibility_conclusion",
] as const satisfies readonly KnowledgeId[];

export const RYAN_OPTIONAL_EVIDENCE = [
  "ryan_group_manipulation_pattern",
  "ryan_manipulative_denial",
] as const satisfies readonly KnowledgeId[];

export const RYAN_RECONSTRUCTION_CARDS = [
  "Laura var ved at samle beviser mod Ryan. Hvis hun talte, ville hele hans facade falde.",
  "Ryan sendte hende til læsesalen under påskud af at ville returnere noget, der tilhørte hende.",
  "Han kendte passagen og valgte afsatsen, fordi de kunne være alene.",
  "Før mødet undersøgte han hendes institutionsophold og skrev en falsk fortælling om selvmord.",
  "Ryan forsøgte at skubbe Laura ud over kanten.",
  "Han rev halskæden af hende, mens hun kæmpede for at slippe fri.",
  "Laura skubbede ham væk i selvforsvar. Ryan mistede balancen og faldt med halskæden i hånden.",
  "Denne gang skal beviserne sikres, Laura advares, og ingen af dem må blive alene på afsatsen.",
] as const;

export function hasAllRyanConclusions(
  state: Pick<GameState, "selectedCaseId" | "knowledge">,
): boolean {
  return (
    state.selectedCaseId === "ryan" &&
    RYAN_CORE_CONCLUSIONS.every((id) => state.knowledge[id])
  );
}

export function hasRyanPartialAdmissionEvidence(
  state: Pick<GameState, "selectedCaseId" | "knowledge">,
): boolean {
  const knowledge = state.knowledge;
  return (
    state.selectedCaseId === "ryan" &&
    knowledge.ryan_laura_on_ledge &&
    knowledge.ryan_necklace_in_hand &&
    knowledge.ryan_necklace_torn_clasp &&
    knowledge.ryan_laura_owns_necklace &&
    knowledge.ryan_laura_neck_injury
  );
}

export function deriveRyanLead(
  state: Pick<GameState, "knowledge" | "caseProgress">,
): string {
  const knowledge = state.knowledge;
  if (knowledge.ryan_attack_prevented) {
    return "Ryans angreb er standset, og både Laura og Ryan lever.";
  }
  if (knowledge.ryan_reconstruction_recorded) {
    if (
      !knowledge.ryan_message_copy_secured ||
      !knowledge.ryan_plan_files_secured
    ) {
      return "Sikr kopier af mødebeskeden, kladden og tidsstemplerne i computerrummet.";
    }
    if (!knowledge.ryan_laura_warned) {
      return "Tal med Laura ved middag, og giv hende beviserne uden at kræve hendes passivitet.";
    }
    return "Nå læsesalen ved middag, og afbryd Ryan ved passagen.";
  }
  if (knowledge.ryan_responsibility_conclusion) {
    return "Lad dagen begynde forfra, og læg en plan, der redder både Laura og Ryan.";
  }
  if (knowledge.ryan_false_suicide_plan_conclusion) {
    return "Sammenhold Ryans plan med den knækkede halskæde og mærket ved Lauras hals.";
  }
  if (knowledge.ryan_arranged_ledge_meeting_conclusion) {
    return "Find tidsstempler, kladder og slettede filer, der viser, hvad Ryan forberedte.";
  }
  if (knowledge.ryan_silencing_motive_conclusion) {
    return "Find ud af, hvordan Ryan fik Laura alene på afsatsen.";
  }
  if (knowledge.ryan_laura_partial_admission) {
    return "Laura indrømmer skubbet, men siger, at Ryan angreb først. Undersøg Ryans handlinger før mødet.";
  }
  if (
    knowledge.ryan_laura_on_ledge &&
    knowledge.ryan_laura_owns_necklace &&
    knowledge.ryan_necklace_torn_clasp
  ) {
    return "Konfronter Laura med hendes tilstedeværelse, halskæden og mærket ved hendes hals.";
  }
  if (knowledge.ryan_necklace_in_hand) {
    return "Find ud af, om kæden blev tabt, givet til Ryan eller revet af under en kamp.";
  }
  return state.caseProgress.currentLead;
}
