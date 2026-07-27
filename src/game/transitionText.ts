import type { SceneId } from "../app/types";

// Editorially normalized display copy based on "Script Vent" in Spillet.dir.
// It is not a verbatim transcription. The unedited Lingo remains in
// Legacy/Decompiled/DirectorDump.txt so conversion and editorial changes can be
// reviewed separately.
export const TRANSITION_TEXT: Readonly<Record<SceneId, string>> = {
  A1: "Laura rejser sig og går ud mod gangen.",
  A2: "Pludselig hører du Ryans stemme. Et øjeblik senere falder han ned fra afsatsen.",
  A3: "Laura går over mod gangen. David kommer og sætter sig.",
  A4: "I ankommer igen til universitetet. Efter et kort møde går folk hver til sit. Laura bliver siddende.",
  B1: "Barbara arbejder ved sin computer. Ryan kommer ind, kalder hende til side, og de begynder at diskutere.",
  B2: "Ryan og Barbara går ud. Et par minutter senere høres et skrig fra kantinen.",
  B3: "Laura og Marie kommer ind i rummet.",
  B4: "Marie forlader lokalet. Du venter lidt og går så hen til Laura.",
  C1: "Ryan rejser sig og går ud i gangen.",
  C2: "Du møder Ryan på vej ind i læsesalen. David følger efter. Kort efter høres et skrig fra kantinen.",
  C3: "David forlader læsesalen. Barbara kommer ind.",
  C4: "I ankommer igen til universitetet. Efter mødet går du med Ryan ind i læsesalen.",
  D1: "David rejser sig og går ud i gangen.",
  D2: "Marie forlader lokalet. Nogle minutter senere høres et skrig fra kantinen.",
  D3: "Barbara går ud. Marie går med.",
  D4: "I ankommer igen til universitetet. Du går med Marie og David ind i grupperummet.",
  E1: "David og Laura taler sammen i gangen, mens Ryan begynder at mobbe Marie.",
  E2: "David og Laura holder op med at tale. David går ind i læsesalen, og Laura er pludselig væk.",
  E3: "Du står og keder dig. Der sker intet som helst.",
  E4: "I ankommer igen til universitetet. Efter mødet går du ud i gangen.",
};
