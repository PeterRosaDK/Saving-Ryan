# Director’s Cut case model

Status: David-, Barbara-, Marie- og Jørgen-sagerne er implementeret og spilbare; Laura er
fortsat det isolerede originalforløb.

## Modes og valg

Titlen tilbyder uden progression-gate:

- **Original historie**, der vælger `laura`;
- **Director’s Cut**, der vælger én aktiveret case fra registryet.

`selectedCaseId` ligger i version 3 af `GameState` og ændres aldrig af et
dagsloop. `RESET_GAME` nulstiller viden, statistik og case-lokal state. Et nyt
Director’s Cut-spil foretager derefter et nyt registry-valg. Poolen indeholder
aktuelt `david`, `barbara`, `marie` og `jorgen`; normal selection er uniform, mens injicerede
random-værdier gør alle udfald deterministisk testbare.

Til målrettet QA læses `?dcCase=<case-id>`. Et gyldigt, aktiveret
Director’s Cut-ID vælges deterministisk og logges i konsollen; et ukendt eller
inaktivt ID giver en advarsel og falder tilbage til normal registry-udvælgelse.
Parameteren bruges kun, når spilleren vælger Director’s Cut, og kan derfor ikke
ændre Original historie. Se `docs/david-playtest.md`,
`docs/barbara-playtest.md`, `docs/marie-playtest.md` og
`docs/jorgen-playtest.md`.

`?qa=1` viser desuden en skjult registry-drevet vælger på titelskærmen med
**Tilfældig case** og én mulighed pr. aktiv Director’s Cut-case. Valget
opdaterer `dcCase` i URL’en og bruger derefter den samme selector som direkte
QA-links. Almindelige spillere ser aldrig morderlisten.

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

## Barbara knowledge graph

Barbara-casen afleder fire kernekonklusioner fra neutrale fakta:

1. **Motiv:** de forfalskede karakterer + Ryans afpresning.
2. **Mulighed:** Barbara og Ryan forlader B2 sammen + hullet i hendes alibi.
3. **Forhåndskendskab til passagen:** den præmordligt åbnede tegning +
   tegningens servicegang fra læsesalen til afsatsen.
4. **Iscenesættelse:** Laura lægger halskæden i tasken, den forsvinder mens
   Barbara har adgang, Barbara gemmer billedet før mordet, halskæden findes i
   Ryans hånd, billedet præsenteres som nyt, og tidsstemplerne sammenholdes.

Fakta kan findes på tværs af loops og i forskellig rækkefølge. Konklusionerne
afledes centralt i `knowledgeGraph.ts`; scene- og dialoglaget uddeler kun
fakta. Først alle fire konklusioner gør Barbara-anklagen afgørende.

`laura_was_in_institution` og
`laura_private_history_not_evidence` er bevidst ikke forudsætninger for nogen
skyldregel. Lauras private helbredsoplysninger forklarer Barbaras
manipulationsforsøg, ikke Lauras skyld. På samme måde er halskædens ejerskab og
fundet i Ryans hånd neutrale, indtil den aktuelle cases øvrige fakta giver dem
betydning.

Den samme legacy-geografi kan derfor have forskellig semantik: E1 indeholder
Davids pickup i David-sagen, B2 registrerer Barbara og Ryan sammen i
Barbara-sagen, mens Laura-sagen beholder den restaurerede Director-betydning.
Casefiltreringen gælder også interaktioner, dialog, tilståelse, rekonstruktion
og prevention, så en action fra en anden case afvises selv ved direkte
state-machine-dispatch.

## Marie knowledge graph

Marie-casen afleder fire rækkefølgeuafhængige konklusioner:

1. **Motiv:** Maries dokumenterede forfatterskab + Ryans trussel om at fjerne
   hendes navn + truslen mod Laura.
2. **Brudt alibi:** Marie forlader D2 før skriget + hævder bagefter, at hun kun
   var væk et øjeblik.
3. **Adgang:** Marie opdager passagen + passagen til afsatsen er verificeret.
4. **Fysisk kontakt:** fragmentet i Ryans hånd + Maries rettelser/initialer +
   resten af den friskrevne side i hendes mappe.

Ingen enkelt del gør Marie skyldig. Papiret fastslår først fysisk kontakt, når
begge stykker og de individuelle kendetegn er kendt. Motivet kræver både det
dokumenterede arbejdsmønster og dagens konkrete trussel. Efter tilståelsen skal
spilleren først sikre en tidsstemplet kopi og gruppens vidner i D1/D2. Først
derefter kan mødet ved passagen standses i C2.

## Finaleformer

Den delte casekontrakt har to finaleformer:

- `npc-confession` for David, Barbara og Marie;
- `special-revelation` for Jørgen.

Begge former angiver et `finaleKnowledgeId`, som ved næste reset åbner den samme
genlæselige rekonstruktionsfase. Jørgen bruger dermed ikke en kunstig
NPC-tilståelse, men genbruger stadig loop, notebook, leads, prevention, score og
ending.

## Jørgen knowledge graph

Jørgen-casen har fem kernekonklusioner fordelt på fire reveal-lag:

1. En anonym note kan kun udlede **en anden husker dagene**, hvis state machine
   faktisk har registreret mindst én transition fra et tidligere loop.
2. **Den ukendte bruger min identitet** kræver login, et usikkert vidne og den
   spillede Jørgens tidsstemplede alibi.
3. **Passagen står delvist uden for reset** kræver et aktivt mærke med en
   kontrolgenstand udenfor og kan først udledes efter næste morgen.
4. Fremtidsfragmentet kræver Jørgens håndskrift, den samtidige intakte side og
   viden fra et senere efterforskningspunkt. Først sammen med identitets- og
   passagebeviserne udledes en senere Jørgen og til sidst:
   **Morderen er mig — men ikke endnu.**

Den almindelige dialogmodel indeholder aldrig Jørgen som anklagelig
`CharacterId`. Spilleren kan fortsat anklage de fire NPC’er; alle tæller som
forkerte anklager uden at låse dialogen.

### Ufravigelig tidsregel

- Normalt nulstilles Jørgens krop, mens hans erindring består.
- Alt helt inde i passagen i resetøjeblikket bevares fysisk.
- Den senere Jørgen blev én gang stående dér. Dagen skabte næste morgens Jørgen
  udenfor uden at fjerne versionen i passagen.
- Der findes derfor præcis to Jørgener efter splittet. Den senere version
  undgår nye duplikationer og skjuler sig mellem resets.
- Det kanoniske mord er et bootstrap-paradoks: den senere Jørgen skaber det
  mord, der får den yngre til at ønske dagen tilbage og gennemleve den
  efterforskning, der senere skaber morderen.

State machine bevarer kun et passageobjekt i `jorgen`-casen. Kontrolobjektet
udenfor nulstilles, og andre cases får ingen fysisk persistens af de samme
knowledge-id’er.

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

Efter tilståelsen eller den særlige afsløring starter næste morgen i fasen
`reconstruction`. De fem David-kort, seks Barbara-kort, syv Marie-kort eller
syv Jørgen-kort gemmes i notesbogen, også hvis spilleren
springer visningen over. Derefter er `Vent ved bogreolen` tilgængelig kun i C2
og kun med den aktuelle cases rekonstruktion og prevention-plan. Hvis vinduet
misses, fortsætter mordet og loopet normalt, mens planen består. Barbara-finalen
viser eksplicit, at Jørgen griber hendes håndled før skubbet.

## Statistik og score

Case-state tæller konfrontationer, forkerte anklager og for tidlige
morderanklager. Antallet af dage er `loop`; kernespor og valgfri støttebeviser
beregnes fra knowledge. David-casens verificerede `parDays` er 2:

- dag 1: gangen E1; derefter brev og Ryan-dialog i middagsslot,
  C2-bevægelsen, ligfund og tilståelse;
- dag 2: rekonstruktion og prevention i C2.

Scoren straffer kun ekstra dage og anklager og belønner de to valgfrie
støttebeviser. Barbara-casens verificerede `parDays` er 3:

- dag 1: morgenmødet, halskædetasken, afpresningen, B2-bevægelsen, ligfund,
  alibi og Lauras skjulte computeraktivitet;
- dag 2: `Intruder`, computerens karakter-/metadatafund, tegningen,
  Barbaras falske hjælp, tidsstempelsammenligning og tilståelse;
- dag 3: privat rekonstruktion og prevention i C2.

Barbara har to valgfrie støttebeviser: Maries observation ved tasken og Davids
observation af ruten mod læsesalen. Parametrene står på case-definitionen.

Maries verificerede `parDays` er 2:

- dag 1: E1-konfrontationen, Maries mappe og trussel, D2-fraværet, alibiet,
  papirfragmentet, den matchende side, støv-/passagesporet og tilståelsen;
- dag 2: privat rekonstruktion, sikring af Maries arbejde og prevention i C2.

Maries to valgfrie støttebeviser er Ryans længere mønster med at tage æren og
Lauras observation af Marie med støv fra læsesalen.

Jørgens verificerede `parDays` er 4:

- dag 1 registrerer en faktisk rute, mordkaldet og fragmentet;
- dag 2 finder note, login og vidne, opdager passagen og placerer eksperimentet;
- dag 3 verificerer persistensen, sammenligner fremtidsfragmentet og møder den
  senere Jørgen gennem reset;
- dag 4 gemmer rekonstruktionen, planter den falske plan og forhindrer mordet.

Resultatkortets normale statistik suppleres datadrevet med to registrerede
Jørgener og én tidsmæssig selvmodsigelse. Andre cases bruger fortsat den
almindelige resultatvisning.

## Text-first assets

Nye scener og replikker er autoritative tekstforløb. Manglende produktion er
registreret maskinlæsbart i
`src/media/directorsCutAssetManifest.ts` og læsevenligt i
`docs/directors-cut-asset-manifest.md`. Hver runtime-placeholder bærer et stabilt
manifest-ID. Senere medier må ændre præsentationen, men ikke knowledge-effects.
Barbara, Marie og Jørgen bruger samme centrale manifest; der findes ikke et parallelt
case-manifest. Tekstfallback og skip-resumé er den autoritative semantik, så
manglende produktion ikke blokerer progression.
