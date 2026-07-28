# Director’s Cut case model

Status: David-sagen er implementeret og spilbar; Laura er fortsat det isolerede
originalforløb.

## Modes og valg

Titlen tilbyder uden progression-gate:

- **Original historie**, der vælger `laura`;
- **Director’s Cut**, der vælger én aktiveret case fra registryet.

`selectedCaseId` ligger i version 3 af `GameState` og ændres aldrig af et
dagsloop. `RESET_GAME` nulstiller viden, statistik og case-lokal state. Et nyt
Director’s Cut-spil foretager derefter et nyt registry-valg. Poolen indeholder
aktuelt kun `david`, men den registry-baserede selector er deterministisk
testbar og klar til flere aktiverede cases.

Til målrettet QA læses `?dcCase=<case-id>`. Et gyldigt, aktiveret
Director’s Cut-ID vælges deterministisk og logges i konsollen; et ukendt eller
inaktivt ID giver en advarsel og falder tilbage til normal registry-udvælgelse.
Parameteren bruges kun, når spilleren vælger Director’s Cut, og kan derfor ikke
ændre Original historie. Se `docs/david-playtest.md`.

## Registry

`src/game/caseDefinitions.ts` er den centrale liste. En case angiver stabilt ID,
mode, enabled-flag, morder, spoilerfri menutekst og scoreparametre. Nye sager
registreres som disabled, indtil deres egen knowledge graph, dialog, overgange,
anklage, prevention og ending er komplette.

Case-specifikt indhold vælges ved grænserne for:

- transition events;
- scene interactions;
- dialogue choices;
- knowledge derivation;
- ending og score.

Dermed kan den delte A1–E4-geografi og state machine genbruges uden at gøre
Laura-regler universelle.

## David knowledge graph

Kernefakta er Sarah/David-bruddet, Davids pickup af halskæden, halskæden i Ryans
hånd og Davids bevægelse efter Ryan. De afleder tre konklusioner:

1. motiv;
2. besiddelse af halskæden umiddelbart før mordet;
3. mulighed og bevægelse efter Ryan.

Pickup og fund kan læres i begge rækkefølger og på forskellige dage. Først når
alle tre konklusioner er kendt, giver en anklage mod David en tilståelse.
Tilståelsen afslører passagen og mordmetoden, men er ikke sejr.

I David-sagen er `necklace_found_in_ryans_hand` et neutralt faktum. Den gamle
Laura-regel, der kombinerer `killer_dropped_necklace` med Lauras ejerskab, kører
kun for `laura`. Lauras ejerskab kan derfor aldrig alene gøre hende skyldig i
Director’s Cut.

## Kildegrænse

Director-dumpet er autoritativt for geografi, tider og eksisterende
sceneplaceringer. Det bekræfter især C2-rækkefølgen: Ryan går ind i læsesalen,
og David følger efter før skriget. Projektrapporten og den restaurerede kode
beskriver derimod Laura som originalens tiltænkte morder og indeholder ikke den
færdige David-forklaring. David som morder, Sarah-motivet, pickup-scenen,
tilståelsen og preventionen kommer derfor fra den godkendte Director’s
Cut-kanon, mens de ligger oven på den verificerede legacy-geografi.

Castet indeholder `Ryan-omSaraOgDavid`, men der er ingen dokumenteret,
semantisk sikker runtime-vej eller transskription, som beviser, at klippet siger
den nye kanoniske replik. Det er derfor bevaret urørt og ikke genbrugt alene på
grund af filnavnet.

## Loop, rekonstruktion og prevention

Efter tilståelsen starter næste morgen i fasen `reconstruction`. De fem private
kort gemmes i notesbogen, også hvis spilleren springer visningen over. Derefter
er `Vent ved bogreolen` tilgængelig kun i C2 og kun i David-sagen. Hvis vinduet
misses, fortsætter mordet og loopet normalt, mens planen består.

## Statistik og score

Case-state tæller konfrontationer, forkerte anklager og for tidlige David-
anklager. Antallet af dage er `loop`; kernespor og valgfri støttebeviser
beregnes fra knowledge. David-casens verificerede `parDays` er 2:

- dag 1: gangen E1; derefter brev og Ryan-dialog i middagsslot,
  C2-bevægelsen, ligfund og tilståelse;
- dag 2: rekonstruktion og prevention i C2.

Scoren straffer kun ekstra dage og anklager og belønner de to valgfrie
støttebeviser. Parametrene står på case-definitionen.

## Text-first assets

Nye scener og replikker er autoritative tekstforløb. Manglende produktion er
registreret maskinlæsbart i
`src/media/directorsCutAssetManifest.ts` og læsevenligt i
`docs/directors-cut-asset-manifest.md`. Hver runtime-placeholder bærer et stabilt
manifest-ID. Senere medier må ændre præsentationen, men ikke knowledge-effects.
