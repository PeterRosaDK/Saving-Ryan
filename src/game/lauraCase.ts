import type { GameState } from "../app/types";

export const LAURA_CORE_CONCLUSIONS = [
  "necklace_connects_laura_to_scene",
] as const;

export function deriveLauraLead(
  state: Pick<GameState, "knowledge" | "caseProgress">,
): string {
  const knowledge = state.knowledge;

  if (knowledge.ryan_was_saved) {
    return "Ryan er reddet, og tidsløkken er brudt.";
  }
  if (knowledge.laura_confessed) {
    if (knowledge.ryan_dismissed_warning) {
      return "Ryan er advaret. Gå til læsesalen næste morgen, og brug passagen til at nå afsatsen først.";
    }
    return "Begynd næste dag, advar Ryan, og brug passagen til at nå afsatsen først.";
  }
  if (
    knowledge.ryan_left_laura &&
    knowledge.necklace_connects_laura_to_scene
  ) {
    return "Konfronter Laura med både motivet og halskæden.";
  }
  if (knowledge.ryan_left_laura) {
    return "Ryan forlod Laura. Find det fysiske bevis, der forbinder hende med gerningsstedet.";
  }
  if (knowledge.necklace_connects_laura_to_scene) {
    return "Halskæden forbinder Laura med gerningsstedet. Find et muligt motiv.";
  }
  if (
    knowledge.marie_trust_earned &&
    knowledge.ryan_and_laura_were_together
  ) {
    return "Marie stoler mere på dig. Spørg hende, hvad hun ved om Ryan og Lauras forhold.";
  }
  if (knowledge.marie_trust_earned) {
    return "Marie stoler mere på dig. Find ud af, hvad Ryan og Laura har været for hinanden.";
  }
  if (knowledge.ryan_bullied_marie) {
    return "Marie virkede tydeligt påvirket af Ryan. Tal med hende om, hvad der skete.";
  }
  if (knowledge.ryan_and_laura_were_together) {
    return "Ryan og Laura har været kærester. Læg mærke til, hvem der kender resten af deres historie.";
  }

  return state.caseProgress.currentLead;
}
