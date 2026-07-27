import type { SceneId } from "../app/types";

// Verbatim wording from "Script Vent" in Spillet.dir. Danish characters are
// represented as Unicode, but the original phrasing and punctuation are kept.
export const TRANSITION_TEXT: Readonly<Record<SceneId, string>> = {
  A1: "Laura rejser sig og går ud mod gangen.",
  A2: "Pludselig hører du Ryans stemme råbe et eller andet, og sekundet efter kommer hans korpus svævende ned fra himlen og splatter ud.",
  A3: "Laura går over mod gangen. David kommer og sætter sig.",
  A4: "I ankommer til universitet. Efter et kort møde går folk hver til sit. Laura bliver siddende.",
  B1: "Barbara sidder og skriver på sin computer. Ryan kommer ind i lokalet. Han kalder Barbara over til sig i hjørnet. De to begynder at diskutere.",
  B2: "Ryan og Barbara går ud af rummet. Et par minutter efter hører du et skrig fra kantinen.",
  B3: "Laura og Marie kommer ind i rummet.",
  B4: "Marie forlader lokalet. Du venter lidt og går så hen til Laura.",
  C1: "Ryan rejser sig og går ud i gangen.",
  C2: "Du går ud i gangen og holder en pause. På vejen derud møder du Ryan, der går ind i læsesalen. Lidt efter går også David derind. Pludselig høres et skrig fra kantinen!",
  C3: "David forlader læsesalen. Barbara kommer ind.",
  C4: "I ankommer til universitet. Efter et kort møde går folk hver til sit. Du går med Ryan ind i læsesalen.",
  D1: "David rejser sig og går ud i gangen.",
  D2: "Marie forlader lokalet. Nogle minutter senere høres et skrig fra kantinen!",
  D3: "Barbara går ud. Marie går med.",
  D4: "I ankommer til universitet. Efter et kort møde går folk hver til sit. Du går med Marie og David ind i grupperummet.",
  E1: "David kommer ud fra grupperummet. Laura kommer fra kantinen og snakker med ham. Imens begynder Ryan at mobbe Marie.",
  E2: "David og Laura holder op med at tale. David går ind i læsesalen, og Laura er pludselig væk.",
  E3: "Du står og keder dig. Der sker intet som helst.",
  E4: "I ankommer til universitet. Efter et kort møde går folk hver til sit. Du går ud i gangen.",
};
