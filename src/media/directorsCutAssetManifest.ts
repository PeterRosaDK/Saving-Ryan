export const DIRECTORS_CUT_ASSET_TYPES = [
  "voice",
  "still",
  "sequence",
  "video",
  "sfx",
] as const;

export type DirectorsCutAssetType =
  (typeof DIRECTORS_CUT_ASSET_TYPES)[number];

export interface DirectorsCutAssetNeed {
  id: string;
  caseId: "david" | "barbara" | "marie";
  scene: string;
  type: DirectorsCutAssetType;
  person: string;
  exactContent: string;
  delivery: string;
  before: string;
  after: string;
  priority: "nødvendig" | "ønskelig";
  reuseCandidate: string | null;
  status: "mangler" | "placeholder" | "leveret" | "integreret";
}

function need(
  value: Omit<DirectorsCutAssetNeed, "caseId" | "status">,
): DirectorsCutAssetNeed {
  return {
    ...value,
    caseId: "david",
    status: "placeholder",
  };
}

function barbaraNeed(
  value: Omit<DirectorsCutAssetNeed, "caseId" | "status">,
): DirectorsCutAssetNeed {
  return {
    ...value,
    caseId: "barbara",
    status: "placeholder",
  };
}

function marieNeed(
  value: Omit<DirectorsCutAssetNeed, "caseId" | "status">,
): DirectorsCutAssetNeed {
  return {
    ...value,
    caseId: "marie",
    status: "placeholder",
  };
}

export const DIRECTORS_CUT_ASSET_MANIFEST = [
  need({
    id: "dc-david-letter-still",
    scene: "D1–D4",
    type: "still",
    person: "Fortæller",
    exactContent:
      "Et sammenkrøllet romantisk brev til Ryan, underskrevet Sarah.",
    delivery: "Læsbar, dokumentarisk detalje uden at vise mere end teksten fastslår.",
    before: "Jørgen undersøger papirkurven.",
    after: "Sarah åbnes som dialogemne.",
    priority: "ønskelig",
    reuseCandidate: "sektorD4-Brev1 / sektorD4-Brev2",
  }),
  need({
    id: "dc-david-ryan-sarah-voice",
    scene: "Dialog med Ryan før mordet",
    type: "voice",
    person: "Ryan",
    exactContent:
      "Min kæreste. Hun var sammen med David før, men det var vist ikke særlig spændende. Hun valgte heldigvis rigtigt til sidst.",
    delivery: "Selvsikker og hånligt ubekymret.",
    before: "Jørgen spørger: Hvem er Sarah?",
    after: "Jørgen udleder Davids motiv.",
    priority: "nødvendig",
    reuseCandidate: "Ryan-omSaraOgLaura (afvist: forkert semantik)",
  }),
  need({
    id: "dc-david-marie-breakup-voice",
    scene: "Dialog med Marie",
    type: "voice",
    person: "Marie",
    exactContent:
      "Dårligt. Jeg fandt ham helt knust. Han prøver at lade, som om det er ligegyldigt, men Ryan gør det bestemt ikke lettere.",
    delivery: "Lavmælt, oprigtigt bekymret.",
    before: "Jørgen spørger til Davids brud med Sarah.",
    after: "Valgfrit støttebevis registreres.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  need({
    id: "dc-david-hall-necklace-sequence",
    scene: "E1, morgen til middag",
    type: "sequence",
    person: "Laura og David",
    exactContent:
      "Laura taber ubemærket sin isbjørnehalskæde; David samler den op og lægger den i lommen.",
    delivery: "Observerende, tydelig årsag og virkning.",
    before: "David og Laura taler i gangen.",
    after: "David er sidste kendte besidder før mordet.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  need({
    id: "dc-david-reading-room-follow-sequence",
    scene: "C2, middag til eftermiddag",
    type: "sequence",
    person: "Fortæller",
    exactContent:
      "Ryan går ind i læsesalen; David ser ham og følger efter; kort efter høres skriget.",
    delivery: "Kort, observerende og entydigt om rækkefølgen.",
    before: "Jørgen opholder sig i læsesalen ved middag.",
    after: "Davids mulighedskonklusion registreres.",
    priority: "ønskelig",
    reuseCandidate: "Legacy C2-tekst (semantisk grundlag)",
  }),
  need({
    id: "dc-david-body-necklace-still",
    scene: "A3/A4",
    type: "still",
    person: "Fortæller",
    exactContent:
      "Ryans knyttede højre hånd med en lille isbjørn i en knækket halskæde mellem fingrene.",
    delivery: "Nøgtern gerningsstedsobservation; ingen skyldfortolkning.",
    before: "Jørgen undersøger liget.",
    after: "Fundet kombineres eventuelt med Davids pickup.",
    priority: "ønskelig",
    reuseCandidate: "sektorA3-Ryan1 / sektorA3-Ryan2",
  }),
  need({
    id: "dc-david-laura-necklace-voice",
    scene: "Dialog med Laura efter mordet",
    type: "voice",
    person: "Laura",
    exactContent:
      "Ja. Låsen har været løs hele dagen. Jeg må have tabt den i gangen, mens jeg talte med David.",
    delivery: "Overrasket og eftertænksom, ikke skyldbetynget.",
    before: "Jørgen spørger, om halskæden er hendes.",
    after: "Ejerskab registreres neutralt.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  need({
    id: "dc-david-alibi-voice",
    scene: "Dialog med David efter mordet",
    type: "voice",
    person: "David",
    exactContent:
      "I læsesalen. Jeg gik derind for at være alene. Jeg hørte skriget ligesom alle andre.",
    delivery: "Kontrolleret og defensiv.",
    before: "Jørgen spørger, hvor David var.",
    after: "En opfølgning kan afsløre nedtoningen.",
    priority: "nødvendig",
    reuseCandidate: "David-omAlibi (afvist indtil semantisk godkendelse)",
  }),
  need({
    id: "dc-david-followup-lie-voice",
    scene: "Dialog med David efter C2-observation",
    type: "voice",
    person: "David",
    exactContent: "Nej. Jeg lagde ikke mærke til ham.",
    delivery: "For hurtigt og afvisende.",
    before: "Jørgen spørger, om David så Ryan gå ind foran sig.",
    after: "Løgnen registreres som valgfrit støttebevis.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  need({
    id: "dc-david-laura-wrong-accusation",
    scene: "Forkert anklage mod Laura efter mordet",
    type: "voice",
    person: "Jørgen og Laura",
    exactContent:
      "Jørgen fremlægger halskædens ejerskab; Laura forklarer den løse lås; Jørgen skelner mellem ejerskab og besiddelse på mordtidspunktet.",
    delivery: "Laura er presset, men præcis; Jørgens konklusion er nøgtern og korrigerende.",
    before: "Spilleren anklager Laura i David-sagen.",
    after: "Efterforskningen fortsætter med et lead mod den sidste besidder.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  need({
    id: "dc-david-suspicions-dialogue",
    scene: "Post-murder-dialoger",
    type: "voice",
    person: "Barbara, David, Laura og Marie",
    exactContent:
      "Jørgen spørger, hvem de tror myrdede Ryan; personen svarer, at de ikke så faldet og ikke har en sikker mistanke.",
    delivery: "Usikkert og påvirket, uden at plante et falsk kernespor.",
    before: "Mordet er sket, og Jørgen spørger til mistanker.",
    after: "Samtalen fortsætter uden knowledge-effect.",
    priority: "ønskelig",
    reuseCandidate: "Legacy omFormodning-klip (ikke godkendt til ny case)",
  }),
  need({
    id: "dc-david-accusation-sequence",
    scene: "Dokumenteret konfrontation efter mordet",
    type: "sequence",
    person: "Jørgen og David",
    exactContent:
      "Jørgen fremlægger motiv, halskæde og bevægelse; David afviser først og tilstår derefter.",
    delivery: "Kontrolleret konfrontation, stigende sammenbrud.",
    before: "Alle tre afgørende konklusioner er fundet.",
    after: "Passagen og mordmetoden er kendt.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  need({
    id: "dc-david-confession-voice",
    scene: "Konfrontationen",
    type: "voice",
    person: "David",
    exactContent:
      "Ryan fandt passagen. David fulgte efter, konfronterede ham om Sarah, skubbede impulsivt og løj bagefter.",
    delivery: "Brudt, skamfuld og præcis.",
    before: "Jørgen spørger, hvordan David nåede afsatsen.",
    after: "Sidste loop og rekonstruktion forberedes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  need({
    id: "dc-david-reconstruction-sequence",
    scene: "Næste morgen efter tilståelsen",
    type: "sequence",
    person: "Jørgen",
    exactContent:
      "Fem private kort om motiv, halskæde, mulighed, mord og planen i læsesalen.",
    delivery: "Klar, koncentreret detektivredegørelse.",
    before: "Dagen starter igen efter tilståelsen.",
    after: "Spilleren får fri navigation og finaleleadet.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  need({
    id: "dc-david-prevention-sequence",
    scene: "C2, sidste loop",
    type: "sequence",
    person: "Jørgen, David og Ryan",
    exactContent:
      "Jørgen stiller sig mellem David og Ryan ved den skjulte dør og stopper forløbet før mordet.",
    delivery: "Anspændt, men uden et fuldbyrdet mord.",
    before: "Spilleren vælger Vent ved bogreolen.",
    after: "Ryan lever, og tidsløkken brydes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  need({
    id: "dc-david-epilogue-sequence",
    scene: "Efter prevention",
    type: "sequence",
    person: "Fortæller",
    exactContent:
      "Ryan overlever, David fjernes, stormen lægger sig, og næste morgen gentager dagen sig ikke.",
    delivery: "Rolig forløsning.",
    before: "Mordet er forhindret.",
    after: "Resultatkortet vises.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-morning-necklace-sequence",
    scene: "A1, morgen til middag",
    type: "sequence",
    person: "Laura, Barbara og fortæller",
    exactContent:
      "Laura viser sin løse isbjørnehalskæde, tager den af og lægger den i sin ydertaske; Barbara står tæt nok på til at se det og få adgang til tasken.",
    delivery: "Tydelig, hverdagslig observation uden skyldfortolkning.",
    before: "Jørgen bliver i kantinen fra morgen til middag.",
    after: "Halskædens placering og Barbaras adgang er kendt.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-intruder-dialogue",
    scene: "Dialog med David",
    type: "voice",
    person: "David",
    exactContent:
      "Barbara er den bedste til computere. På nettet kalder hun sig Intruder.",
    delivery: "Tørt, konstaterende og uden mordmistanke.",
    before: "Jørgen spørger, hvem der ved mest om computere.",
    after: "Intruder kan bruges som password på Barbaras computer.",
    priority: "nødvendig",
    reuseCandidate: "Legacy Freshs Intruder-spor",
  }),
  barbaraNeed({
    id: "dc-barbara-blackmail-sequence",
    scene: "B1/B2 før mordet",
    type: "sequence",
    person: "Ryan og Barbara",
    exactContent:
      "Ryan fortæller Barbara, at han har opdaget hendes forfalskede karakterer, og kræver hendes fortsatte hjælp for at tie.",
    delivery: "Dæmpet, truende og entydig om afpresningen.",
    before: "Jørgen aflytter diskussionen.",
    after: "Barbaras motiv kan kombineres med karakterfilerne.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-computer-grade-screen",
    scene: "B2/B3, Barbaras computer",
    type: "still",
    person: "Computerinterface",
    exactContent:
      "Karakterfiler viser, at Barbara har ændret sine egne registrerede resultater.",
    delivery: "Læsbar skærm uden ekstra anklagende tekst.",
    before: "Intruder-passwordet bruges.",
    after: "Karakterforfalskningen registreres.",
    priority: "nødvendig",
    reuseCandidate: "Legacy Freshs Barbara-computer",
  }),
  barbaraNeed({
    id: "dc-barbara-computer-recent-files",
    scene: "B2/B3, Barbaras computer",
    type: "still",
    person: "Computerinterface",
    exactContent:
      "Nyligt åbnede filer viser bygningstegningerne og et billede af Lauras isbjørnehalskæde, begge åbnet før mordet.",
    delivery: "Præcise filnavne og tidsstempler.",
    before: "Jørgen vælger nyligt åbnede filer.",
    after: "Barbaras forhåndsviden er dokumenteret.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-building-plan-screen",
    scene: "B2/B3, Barbaras computer",
    type: "still",
    person: "Computerinterface",
    exactContent:
      "Bygningstegninger viser en skjult passage fra læsesalen til afsatsen over kantinen.",
    delivery: "Arkitektonisk, tydelig og uden dramatisk fortolkning.",
    before: "Jørgen åbner tegningerne fra listen over nylige filer.",
    after: "Passagens forløb er kendt.",
    priority: "nødvendig",
    reuseCandidate: "Legacy building-plan materiale",
  }),
  barbaraNeed({
    id: "dc-barbara-laura-missing-necklace",
    scene: "Dialog med Laura",
    type: "voice",
    person: "Laura",
    exactContent:
      "Laura lagde halskæden i ydertasken om morgenen og opdager nu, at den er væk.",
    delivery: "Overrasket og konkret, uden skyldbetoning.",
    before: "Jørgen spørger til halskæden og tasken.",
    after: "Tyveriet kan efterforskes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-body-necklace-still",
    scene: "A3/A4",
    type: "still",
    person: "Fortæller",
    exactContent:
      "Ryans hånd holder den lille isbjørn fra Lauras halskæde.",
    delivery: "Nøgtern gerningsstedsobservation uden skyldfortolkning.",
    before: "Jørgen undersøger liget.",
    after: "Fundet kan sammenholdes med tasken og Barbaras gemte billede.",
    priority: "nødvendig",
    reuseCandidate: "sektorA3-Ryan1 / sektorA3-Ryan2",
  }),
  barbaraNeed({
    id: "dc-barbara-reading-room-route-sequence",
    scene: "B2/C2, mordforløbet",
    type: "sequence",
    person: "Barbara og Ryan",
    exactContent:
      "Barbara fører Ryan gennem den skjulte dør bag bogreolen, giver ham Lauras halskæde på afsatsen og stiller sig bag ham, mens han råber ned til Jørgen.",
    delivery: "Geografisk entydig rekonstruktion; må ikke afsløre handlingen før tilståelsen.",
    before: "Ryan og Barbara forlader computerrummet sammen.",
    after: "Ryan falder; forløbet afsløres senere i tilståelsen.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-alibi-dialogue",
    scene: "Dialog med Barbara efter mordet",
    type: "voice",
    person: "Barbara",
    exactContent:
      "Barbara siger, at hun gik fra Ryan i gangen og var alene ved sin computer, men kan ikke få tidsrummet til at hænge sammen.",
    delivery: "Kontrolleret, hjælpsom og en anelse for præcis.",
    before: "Jørgen spørger, hvor hun var.",
    after: "Hullet i alibiet registreres.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-helper-sequence",
    scene: "Dialog med Barbara efter computerobservationen",
    type: "sequence",
    person: "Barbara og Jørgen",
    exactContent:
      "Barbara tilbyder at hjælpe, viser Lauras private institutionsoplysninger og halskædebilledet som nye fund og forsøger at rette mistanken mod Laura.",
    delivery: "Tilsyneladende hjælpsom; Jørgen skelner eksplicit mellem helbredsoplysninger og skyldbevis.",
    before: "Jørgen beder Barbara om hjælp.",
    after: "Det iscenesatte fund og den neutrale privathistorik registreres.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-timestamp-comparison",
    scene: "B2/B3, Barbaras computer",
    type: "sequence",
    person: "Jørgen",
    exactContent:
      "Jørgen sammenholder tidsstemplerne: Barbara gemte halskædebilledet og åbnede tegningerne før mordet, men præsenterede billedet som et nyt fund bagefter.",
    delivery: "Kort, analytisk og kronologisk entydig.",
    before: "Både de nylige filer og Barbaras hjælpesekvens er kendt.",
    after: "Iscenesættelsen kan konkluderes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-marie-bag-dialogue",
    scene: "Dialog med Marie",
    type: "voice",
    person: "Marie",
    exactContent:
      "Marie så Barbara stå alene ved Lauras taske tidligere på dagen.",
    delivery: "Forsigtigt og uden at overdrive, hvad hun så.",
    before: "Jørgen spørger, hvem der var ved tasken.",
    after: "Valgfrit støttebevis registreres.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-david-movement-dialogue",
    scene: "Dialog med David",
    type: "voice",
    person: "David",
    exactContent:
      "David så Barbara føre Ryan væk fra grupperummet mod læsesalen.",
    delivery: "Præcis øjenvidneforklaring uden gæt om hensigten.",
    before: "Jørgen spørger til Barbara og Ryan.",
    after: "Valgfrit støttebevis registreres.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-suspicions-dialogue",
    scene: "Post-murder-dialoger",
    type: "voice",
    person: "Barbara, David, Laura og Marie",
    exactContent:
      "Jørgen spørger, hvem de tror myrdede Ryan; svarene giver ingen sikker mistanke eller falsk kerneviden.",
    delivery: "Usikkert og påvirket.",
    before: "Mordet er sket.",
    after: "Samtalen fortsætter uden knowledge-effect.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-accusation-sequence",
    scene: "Dokumenteret konfrontation efter mordet",
    type: "sequence",
    person: "Jørgen og Barbara",
    exactContent:
      "Jørgen fremlægger motivet, hendes rute, forhåndskendskabet til passagen og den iscenesatte halskæde.",
    delivery: "Kontrolleret og bevisbaseret med stigende pres.",
    before: "Alle fire afgørende konklusioner er fundet.",
    after: "Barbara tilstår.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-confession-voice",
    scene: "Konfrontationen",
    type: "voice",
    person: "Barbara",
    exactContent:
      "Barbara tilstår karakterforfalskningen, afpresningen, tyveriet af halskæden, lokningen gennem passagen, skubbet og forsøget på at ramme Laura.",
    delivery: "Kontrolleret facade, der gradvist bryder sammen.",
    before: "Jørgen har fremlagt alle fire konklusioner.",
    after: "Mordmetoden og planen for næste loop er kendt.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-reconstruction-sequence",
    scene: "Næste morgen efter tilståelsen",
    type: "sequence",
    person: "Jørgen",
    exactContent:
      "Seks private kort om forfalskning og afpresning, adgang til halskæden, tegningerne, ruten med Ryan, skubbet og den falske hjælp.",
    delivery: "Klar, koncentreret detektivredegørelse.",
    before: "Dagen starter igen efter tilståelsen.",
    after: "Spilleren får fri navigation og finaleleadet.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-prevention-sequence",
    scene: "C2, sidste loop",
    type: "sequence",
    person: "Jørgen, Barbara og Ryan",
    exactContent:
      "Jørgen venter ved bogreolen, afbryder Barbara før passagen og tager halskæden fra hendes hånd, mens Ryan indser afpresningens konsekvens.",
    delivery: "Anspændt, fysisk tydelig og uden et fuldbyrdet mord.",
    before: "Spilleren vælger Vent ved bogreolen.",
    after: "Ryan lever, og tidsløkken brydes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  barbaraNeed({
    id: "dc-barbara-epilogue-sequence",
    scene: "Efter prevention",
    type: "sequence",
    person: "Fortæller",
    exactContent:
      "Ryan overlever, Barbara bliver afsløret, Laura renses for mistanke, stormen lægger sig, og næste morgen gentager dagen sig ikke.",
    delivery: "Rolig forløsning med tydelig afslutning for alle centrale tråde.",
    before: "Mordet er forhindret.",
    after: "Resultatkortet viser fire af fire konklusioner.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  marieNeed({
    id: "dc-marie-morning-humiliation-sequence",
    scene: "E1, morgen til middag",
    type: "sequence",
    person: "Marie og Ryan",
    exactContent:
      "Ryan tager en gennemrettet projektside, kalder arbejdet ubrugeligt og siger, at Maries navn bliver fjernet.",
    delivery: "Offentlig, kontrollerende ydmygelse; Marie er vred og såret.",
    before: "Jørgen opholder sig i gangen om morgenen.",
    after: "Ryans krav om Maries arbejde og navn registreres.",
    priority: "nødvendig",
    reuseCandidate:
      "Legacy E1 bekræfter mobningen, men intet klip dokumenterer den nye ordlyd.",
  }),
  marieNeed({
    id: "dc-marie-work-folder-sequence",
    scene: "D1–D4, Maries projektmappe",
    type: "still",
    person: "Dokument",
    exactContent:
      "Maries initialer og karakteristiske røde rettelser går igen på analysesider, som matcher fællesrapporten.",
    delivery: "Læsbar, neutral dokumentation af forfatterskab.",
    before: "Jørgen undersøger Maries projektmappe.",
    after: "Maries væsentlige arbejde registreres som faktum.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  marieNeed({
    id: "dc-marie-work-dialogue",
    scene: "Dialog med Marie",
    type: "voice",
    person: "Marie",
    exactContent:
      "Analysen er min. Jeg har også gennemrettet de centrale afsnit, men Ryan afleverer siderne, som om de er hans.",
    delivery: "Forsigtig, men præcis og efterhånden mere fast.",
    before: "Jørgen spørger, hvor meget af rapporten der er hendes.",
    after: "Maries forfatterskab registreres.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  marieNeed({
    id: "dc-marie-threat-dialogue",
    scene: "Dialog med Marie efter morgenkonfrontationen",
    type: "voice",
    person: "Marie",
    exactContent:
      "Ryan vil fjerne hendes navn og bruge Lauras private fortid mod dem, hvis Marie protesterer.",
    delivery: "Lavmælt og skamfuld over at gentage truslen, ikke anklagende.",
    before: "Jørgen har set Ryans krav om Maries arbejde.",
    after: "Den konkrete trussel mod Laura registreres.",
    priority: "nødvendig",
    reuseCandidate:
      "Marie-Fortrolighed-klippene bevares til Original historie; ny semantik kræver tekstfallback.",
  }),
  marieNeed({
    id: "dc-marie-passage-discovery-sequence",
    scene: "C1, morgen til middag",
    type: "sequence",
    person: "Marie",
    exactContent:
      "Marie søger ind i læsesalen, støtter sig til bogreolen og opdager tilfældigt den skjulte dør uden at gå hele vejen.",
    delivery: "Stille chok og nysgerrighed; scenen må ikke fremstå som mordplanlægning.",
    before: "Marie er blevet ydmyget.",
    after: "Hendes forhåndskendskab til passagen registreres neutralt.",
    priority: "nødvendig",
    reuseCandidate:
      "sektorC1 kan bruges som neutral læsesalsbaggrund; legacy har ingen Marie-passagehandling.",
  }),
  marieNeed({
    id: "dc-marie-leaves-group-sequence",
    scene: "D2, middag til eftermiddag",
    type: "sequence",
    person: "Marie",
    exactContent:
      "Marie lægger mappen fra sig, forlader grupperummet kort før skriget og vender senere rystet tilbage.",
    delivery: "Observerende og tidsligt præcis uden at vise mordet.",
    before: "Jørgen er i grupperummet ved middag.",
    after: "Maries fravær registreres.",
    priority: "nødvendig",
    reuseCandidate:
      "Legacy D2 fastslår, at Marie går før skriget, og er semantisk grundlag for teksten.",
  }),
  marieNeed({
    id: "dc-marie-alibi-dialogue",
    scene: "Dialog med Marie efter mordet",
    type: "voice",
    person: "Marie",
    exactContent:
      "Marie hævder, at hun var i grupperummet og kun gik ud et øjeblik for at få luft.",
    delivery: "Rystet, kortfattet og bevidst upræcis.",
    before: "Jørgen spørger til mordøjeblikket.",
    after: "Påstanden kan sammenholdes med D2-observationen.",
    priority: "nødvendig",
    reuseCandidate:
      "Marie-omAlibi er ikke genbrugt uden dokumenteret transskription af den nye casepåstand.",
  }),
  marieNeed({
    id: "dc-marie-body-fragment-still",
    scene: "A3/A4, Ryans hånd",
    type: "still",
    person: "Fortæller",
    exactContent:
      "Et friskrevet papirfragment i Ryans hånd med røde rettelser, initialerne M.S. og en halv håndskrevet sætning.",
    delivery: "Nøgtern gerningsstedsdetalje uden skyldkonklusion.",
    before: "Jørgen undersøger liget.",
    after: "Fragmentet kan sammenlignes med Maries mappe.",
    priority: "nødvendig",
    reuseCandidate:
      "sektorA3-Ryan1 / sektorA3-Ryan2 kan bære tekstfallback, men viser ikke papiret.",
  }),
  marieNeed({
    id: "dc-marie-torn-page-comparison",
    scene: "D3/D4, dokumentundersøgelse",
    type: "still",
    person: "Dokument",
    exactContent:
      "Fragment og friskrevet side vises side om side; tekst, initialer og ujævnt rivemønster passer fysisk sammen.",
    delivery: "Kriminalteknisk tydelig og uden ekstra fortolkning.",
    before: "Fragmentet er fundet i Ryans hånd.",
    after: "Den fysiske kontaktkonklusion udledes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  marieNeed({
    id: "dc-marie-dust-witness-dialogue",
    scene: "Dialog med Laura efter mordet",
    type: "voice",
    person: "Laura",
    exactContent:
      "Laura så Marie komme fra læsesalens retning, rystet og med lyst murstøv på ærmet.",
    delivery: "Bekymret og forsigtig; Laura så ikke selve mordet.",
    before: "Jørgen spørger, om Laura så Marie vende tilbage.",
    after: "Et valgfrit støttebevis og et lead mod læsesalen registreres.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  marieNeed({
    id: "dc-marie-passage-trace-sequence",
    scene: "C3/C4, læsesalen",
    type: "still",
    person: "Fortæller",
    exactContent:
      "Lyst murstøv bag bogreolen matcher Maries ærme, og hendes håndaftryk bryder støvlaget ved mekanismen.",
    delivery: "Nøgtern fysisk observation.",
    before: "Laura har bemærket støvet på Marie.",
    after: "Maries kendskab til passagen registreres.",
    priority: "nødvendig",
    reuseCandidate: "sektorC3 som neutral baggrund; selve sporet mangler.",
  }),
  marieNeed({
    id: "dc-marie-accusation-sequence",
    scene: "Kvalificeret eller for tidlig anklage efter mordet",
    type: "sequence",
    person: "Jørgen og Marie",
    exactContent:
      "Jørgen fremlægger kun de beviskategorier, han faktisk har; Marie afviser tidlige anklager og presses af den fulde kæde.",
    delivery: "Bevisbaseret, alvorlig og uden at frikende handlingen.",
    before: "Spilleren anklager Marie.",
    after: "Efterforskningen fortsætter eller tilståelsen begynder.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  marieNeed({
    id: "dc-marie-confession-voice",
    scene: "Den dokumenterede konfrontation",
    type: "voice",
    person: "Marie",
    exactContent:
      "Marie forklarer det langvarige tyveri af hendes arbejde, dagens trussel, passagefundet, den iturevne side, det impulsive skub og løgnen bagefter.",
    delivery: "Sammenbrudt og præcis; anger uden krav om frifindelse.",
    before: "Alle fire kernekonklusioner er kendt.",
    after: "Mordmetoden og den aktive prevention-plan er kendt.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  marieNeed({
    id: "dc-marie-reconstruction-sequence",
    scene: "Næste morgen efter tilståelsen",
    type: "sequence",
    person: "Jørgen",
    exactContent:
      "Syv private kort om nedbrydning, trussel, passage, konfrontation, papirspor, mord og plan.",
    delivery: "Kort, empatisk og analytisk.",
    before: "Dagen nulstilles efter tilståelsen.",
    after: "Rekonstruktionen gemmes og finaleloopet begynder.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  marieNeed({
    id: "dc-marie-secure-work-sequence",
    scene: "D1/D2, sidste loop",
    type: "sequence",
    person: "Jørgen, Marie, Laura, David og Ryan",
    exactContent:
      "Jørgen tager tidsstemplede kopier, får gruppens vidner og dokumenterer Maries forfatterskab og Ryans trussel.",
    delivery: "Fast og praktisk; dette fjerner Ryans konkrete magtmiddel.",
    before: "Rekonstruktionen er gennemført.",
    after: "Maries arbejde er sikret, men mødet ved passagen skal stadig standses.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  marieNeed({
    id: "dc-marie-prevention-sequence",
    scene: "C2, sidste loop",
    type: "sequence",
    person: "Jørgen, Marie og Ryan",
    exactContent:
      "Jørgen møder Marie før passagen, fortæller at hendes arbejde er sikret og forhindrer, at hun følger Ryan alene.",
    delivery: "Anspændt og menneskelig; ingen fysisk kamp.",
    before: "Maries arbejde er sikret.",
    after: "Ryan overlever.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  marieNeed({
    id: "dc-marie-epilogue-sequence",
    scene: "Efter prevention",
    type: "sequence",
    person: "Fortæller",
    exactContent:
      "Ryan overlever, Maries arbejde anerkendes, Laura udstilles ikke, stormen lægger sig, og dagen gentager sig ikke.",
    delivery: "Rolig forløsning uden at bagatellisere den afværgede handling.",
    before: "Mødet på afsatsen er forhindret.",
    after: "Resultatkortet vises.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
] as const satisfies readonly DirectorsCutAssetNeed[];

export type DirectorsCutAssetId =
  (typeof DIRECTORS_CUT_ASSET_MANIFEST)[number]["id"];

export function hasDirectorsCutAsset(id: string): boolean {
  return DIRECTORS_CUT_ASSET_MANIFEST.some((entry) => entry.id === id);
}
