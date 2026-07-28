import type { GameState, KnowledgeId } from "../app/types";

export const JORGEN_CORE_CONCLUSIONS = [
  "jorgen_other_remembers_conclusion",
  "jorgen_identity_used_conclusion",
  "jorgen_passage_persistence_conclusion",
  "jorgen_later_self_exists_conclusion",
  "jorgen_future_self_murderer_conclusion",
] as const satisfies readonly KnowledgeId[];

export const JORGEN_OPTIONAL_EVIDENCE = [
  "jorgen_npc_alibis_hold",
  "jorgen_unknown_knows_routes",
] as const satisfies readonly KnowledgeId[];

export const JORGEN_RECONSTRUCTION_CARDS = [
  "Alle de andre passede ind i dagen. Morderen stod uden for den.",
  "En version af mig blev i passagen under reset og blev ikke erstattet.",
  "Næste morgen fandtes både den Jørgen, der huskede dagen, og den Jørgen, dagen genskabte.",
  "Den senere Jørgen gav Ryan en side fra min fremtid, så Ryan ville kalde på mig.",
  "Han dræbte Ryan for at skabe det chok, der fik mig til at ønske dagen tilbage og begynde den vej, som skabte ham.",
  "Han tror, at alt, hvad jeg gør, allerede er en del af hans fortid.",
  "Jeg må få ham til at handle på en forventning, jeg selv planter — og derefter gøre noget andet.",
] as const;

export function hasAllJorgenConclusions(
  state: Pick<GameState, "selectedCaseId" | "knowledge">,
): boolean {
  return (
    state.selectedCaseId === "jorgen" &&
    JORGEN_CORE_CONCLUSIONS.every((id) => state.knowledge[id])
  );
}

export function deriveJorgenLead(
  state: Pick<GameState, "knowledge" | "caseProgress">,
): string {
  const knowledge = state.knowledge;
  if (knowledge.jorgen_revelation_completed) {
    return knowledge.jorgen_decoy_planted
      ? "Gå gennem passagen tidligere end den falske plan siger."
      : "Placér en falsk plan, som min senere udgave vil læse.";
  }
  if (knowledge.jorgen_future_self_murderer_conclusion) {
    return "Bliv i passagen ved reset og find den person, der står uden for dagen.";
  }
  if (knowledge.jorgen_later_self_exists_conclusion) {
    return "Sammenlign papiret hos Ryan med mine egne noter.";
  }
  if (knowledge.jorgen_passage_persistence_conclusion) {
    return "Sammenlign papiret hos Ryan med mine egne noter.";
  }
  if (
    knowledge.jorgen_identity_used_conclusion &&
    !knowledge.jorgen_passage_test_placed
  ) {
    return "Test, om den skjulte passage nulstilles sammen med resten af bygningen.";
  }
  if (
    knowledge.jorgen_passage_test_placed &&
    !knowledge.jorgen_passage_marker_survived
  ) {
    return "Lad dagen nulstille, og kontrollér mærket i passagen næste morgen.";
  }
  if (knowledge.jorgen_other_remembers_conclusion) {
    return "Undersøg, hvem der bruger mine oplysninger, mens jeg er et andet sted.";
  }
  if (knowledge.jorgen_prior_loop_reference_ready) {
    return "Undersøg den anonyme besked i grupperummet.";
  }
  return state.caseProgress.currentLead;
}
