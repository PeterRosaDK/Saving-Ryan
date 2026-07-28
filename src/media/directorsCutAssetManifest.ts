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
  caseId: "laura" | "david" | "barbara" | "marie" | "jorgen" | "ryan";
  scene: string;
  type: DirectorsCutAssetType;
  person: string;
  exactContent: string;
  delivery: string;
  before: string;
  after: string;
  fallbackText: string;
  priority: "nødvendig" | "ønskelig";
  reuseCandidate: string | null;
  status: "mangler" | "placeholder" | "leveret" | "integreret";
}

type DirectorsCutAssetInput = Omit<
  DirectorsCutAssetNeed,
  "caseId" | "status" | "fallbackText"
> & {
  fallbackText?: string;
};

function legacyNeed(
  value: DirectorsCutAssetInput,
): DirectorsCutAssetNeed {
  return {
    ...value,
    fallbackText: value.fallbackText ?? value.exactContent,
    caseId: "laura",
    status: "placeholder",
  };
}

function need(
  value: DirectorsCutAssetInput,
): DirectorsCutAssetNeed {
  return {
    ...value,
    fallbackText: value.fallbackText ?? value.exactContent,
    caseId: "david",
    status: "placeholder",
  };
}

function barbaraNeed(
  value: DirectorsCutAssetInput,
): DirectorsCutAssetNeed {
  return {
    ...value,
    fallbackText: value.fallbackText ?? value.exactContent,
    caseId: "barbara",
    status: "placeholder",
  };
}

function marieNeed(
  value: DirectorsCutAssetInput,
): DirectorsCutAssetNeed {
  return {
    ...value,
    fallbackText: value.fallbackText ?? value.exactContent,
    caseId: "marie",
    status: "placeholder",
  };
}

function jorgenNeed(
  value: DirectorsCutAssetInput,
): DirectorsCutAssetNeed {
  return {
    ...value,
    fallbackText: value.fallbackText ?? value.exactContent,
    caseId: "jorgen",
    status: "placeholder",
  };
}

function ryanNeed(
  value: DirectorsCutAssetInput,
): DirectorsCutAssetNeed {
  return {
    ...value,
    fallbackText: value.fallbackText ?? value.exactContent,
    caseId: "ryan",
    status: "placeholder",
  };
}

export const DIRECTORS_CUT_ASSET_MANIFEST = [
  legacyNeed({
    id: "legacy-laura-e1-bullying-still",
    scene: "E1, morgen til middag",
    type: "still",
    person: "Ryan og Marie",
    exactContent:
      "Ryan nedgør Maries arbejde i gangen, mens hun forsøger at forsvare sig og bliver tydeligt rystet.",
    delivery:
      "Observerende og alvorlig; Ryan er dominerende, Marie presset, uden karikeret fysisk trussel.",
    before:
      "Den oprindelige overgangstekst placerer David og Laura i samtale længere nede ad gangen.",
    after:
      "Spillet viser tydeligt: Nyt spor — Ryan mobber Marie.",
    fallbackText:
      "Ryan går efter Marie. Mens de andre taler videre, nedgør han hendes arbejde, indtil hun tydeligt er rystet.",
    priority: "nødvendig",
    reuseCandidate:
      "sektorE1 er en semantisk neutral gangbaggrund, men viser ikke personerne; ny still ønskes.",
  }),
  legacyNeed({
    id: "legacy-laura-sarah-question-voice",
    scene: "Dialog med Ryan før mordet",
    type: "voice",
    person: "Jørgen",
    exactContent:
      "Jeg fandt et brev fra Sarah. Hvad skete der mellem dig og Laura?",
    delivery: "Roligt undersøgende og uden anklagende tone.",
    before: "Sarahs brev er fundet i grupperummets papirkurv.",
    after:
      "Det eksisterende Ryan-omSaraOgLaura-klip afspilles som svar.",
    priority: "ønskelig",
    reuseCandidate:
      "Ryans eksisterende portræt og svarvideo bruges allerede; kun Jørgens spørgsmål mangler som lyd.",
  }),
  legacyNeed({
    id: "legacy-laura-confession-sequence",
    scene: "Den afgørende Laura-konfrontation efter mordet",
    type: "sequence",
    person: "Laura og Jørgen",
    exactContent:
      "Efter Peter-BeskyldLaura3 forklarer Laura bruddet, den skjulte passage og skubbet på afsatsen.",
    delivery:
      "Presset og sammenbrudt, men forståelig; passagens placering og mordforløbet skal være entydige.",
    before:
      "Jørgen fremlægger både motivet og halskædens forbindelse til gerningsstedet.",
    after:
      "Laura tilstår, passagen registreres, og det senere prevention-loop åbnes.",
    priority: "nødvendig",
    reuseCandidate:
      "Peter-BeskyldLaura3 leverer anklagen, men Director indeholder ingen dækkende svarsekvens.",
  }),
  legacyNeed({
    id: "legacy-laura-prevention-sequence",
    scene: "C1, sidste loop",
    type: "sequence",
    person: "Jørgen, Laura og Ryan",
    exactContent:
      "Jørgen bruger passagen, når afsatsen først og stiller sig mellem Laura og Ryan, før skubbet kan ske.",
    delivery:
      "Anspændt og geografisk klar; indgrebet sker før fysisk skade.",
    before:
      "Laura har tilstået, og en almindelig advarsel til Ryan er allerede slået fejl.",
    after: "Ryan lever, og tidsløkken brydes.",
    priority: "nødvendig",
    reuseCandidate:
      "Læsesals- og kantinestills kan etablere stederne, men der findes ingen legacy-finale.",
  }),
  legacyNeed({
    id: "legacy-laura-epilogue-sequence",
    scene: "Efter det afværgede mord",
    type: "sequence",
    person: "Fortæller og gruppen",
    exactContent:
      "Ryan overlever, Laura standses, Jørgens viden forklarer indgrebet, og dagen fortsætter uden endnu et reset.",
    delivery:
      "Kort og forløsende uden at bagatellisere mordforsøget.",
    before: "Jørgen har afværget skubbet på afsatsen.",
    after: "Resultatskærmen viser, at Ryan lever.",
    priority: "ønskelig",
    reuseCandidate:
      "A1-kantinebaggrunden bruges allerede i slutvisningen, men ingen egentlig epilogsekvens findes.",
  }),
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
  jorgenNeed({
    id: "dc-jorgen-murder-call-sequence",
    scene: "A2, mordøjeblikket",
    type: "sequence",
    person: "Ryan, Jørgen og ukendt skikkelse",
    exactContent:
      "Ryan holder et iturevet ark, kalder specifikt på Jørgen og bliver skubbet af en skikkelse bag sig.",
    delivery: "Chokerende og observeret fra afstand; skikkelsen må ikke kunne identificeres endnu.",
    before: "Jørgen er i kantinen ved middag.",
    after: "Ryan er død, og forbindelsen mellem kaldet og papiret registreres.",
    priority: "nødvendig",
    reuseCandidate:
      "Legacy A2 fastslår faldet, men ikke papir eller gerningsperson.",
  }),
  jorgenNeed({
    id: "dc-jorgen-previous-loop-note",
    scene: "D1–D4 efter mindst ét reset",
    type: "still",
    person: "Dokument",
    exactContent:
      "En anonym seddel beskriver den faktiske rækkefølge, hvori Jørgen lod tiden gå i det foregående loop.",
    delivery: "Nøgtern og præcis; ingen antydning af dobbeltgænger.",
    before: "Et tidligere loops transitioner er registreret.",
    after: "Konklusionen om en anden loop-hukommelse kan udledes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  jorgenNeed({
    id: "dc-jorgen-login-audit",
    scene: "B1–B3, computerlog",
    type: "still",
    person: "Computerinterface",
    exactContent:
      "Auditloggen viser Jørgens login ved læsesalen samtidig med tidsstemplede handlinger i computerrummet.",
    delivery: "Teknisk læsbar og neutral; først en framing-hypotese.",
    before: "Jørgen ved, at en anden husker loopene.",
    after: "Misbrug af identitet og den spillede Jørgens alibi registreres.",
    priority: "nødvendig",
    reuseCandidate:
      "Barbaras legacy-computerflade kan være neutral baggrund, men viser ikke den nye log.",
  }),
  jorgenNeed({
    id: "dc-jorgen-lookalike-witness",
    scene: "Dialog med Marie",
    type: "voice",
    person: "Marie",
    exactContent:
      "Marie så ryggen og frakken på en person, der lignede Jørgen, ved bogreolen, mens den spillede Jørgen var et andet sted.",
    delivery: "Usikker og forsigtig; hun så ikke et ansigt.",
    before: "Det fremmede login er kendt.",
    after: "Identitetskonklusionen kan kombineres med log og alibi.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  jorgenNeed({
    id: "dc-jorgen-npc-alibi-dialogue",
    scene: "Post-murder-dialoger",
    type: "voice",
    person: "Barbara, David, Laura og Marie",
    exactContent:
      "Hver person giver en rute, som kan kontrolleres og ikke placerer dem ved skubbet.",
    delivery: "Presset, men konsistent og uden falske kernebeviser.",
    before: "Jørgen spørger til alibi eller teori.",
    after: "Normale mistanker svækkes.",
    priority: "ønskelig",
    reuseCandidate:
      "Legacy alibi-klip er ikke godkendt til de nye præcise ruter.",
  }),
  jorgenNeed({
    id: "dc-jorgen-wrong-accusation",
    scene: "Forkert NPC-anklage",
    type: "sequence",
    person: "Jørgen og den anklagede",
    exactContent:
      "Anklagen afvises med kontrollerbart alibi; Jørgen erkender gradvist, at morderen måske ikke passer ind i dagen.",
    delivery: "Alvorlig og korrigerende, uden humor.",
    before: "Spilleren anklager en af de fire NPC’er.",
    after: "Statistik tælles, og efterforskningen fortsætter.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  jorgenNeed({
    id: "dc-jorgen-alibi-review",
    scene: "D3/D4, samlet tidslinje",
    type: "sequence",
    person: "Jørgen",
    exactContent:
      "Jørgen sammenholder alle fire NPC-ruter og konstaterer, at ingen normal gerningsperson passer i mordøjeblikket.",
    delivery: "Metodisk og foruroligende.",
    before: "Ryan er død.",
    after: "Valgfrit støttebevis registreres.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  jorgenNeed({
    id: "dc-jorgen-passage-test",
    scene: "C1–C4, aktivt eksperiment",
    type: "sequence",
    person: "Jørgen",
    exactContent:
      "Jørgen ridser et kryds og lægger en dateret strimmel inde i passagen samt en kontrolstrimmel udenfor.",
    delivery: "Praktisk, reproducerbar og tydelig om kontrollen.",
    before: "Identitetsmisbruget og passagen er kendt.",
    after: "Spilleren må gennemføre et reset.",
    priority: "nødvendig",
    reuseCandidate:
      "Læsesalsstills kan bruges som baggrund; eksperimentet er nyt.",
  }),
  jorgenNeed({
    id: "dc-jorgen-passage-persistence",
    scene: "C1–C4, morgenen efter eksperimentet",
    type: "still",
    person: "Fortæller",
    exactContent:
      "Den daterede strimmel og ridsen inde i passagen består; kontrolmærket udenfor er nulstillet; et ældre fodspor er bevaret.",
    delivery: "Kriminalteknisk tydelig og uden fuld identitetsafsløring.",
    before: "Dagen er nulstillet efter det aktive eksperiment.",
    after: "Passagens reset-blindpunkt og ophold under reset registreres.",
    priority: "nødvendig",
    reuseCandidate: "sektorC1/C3 som neutral baggrund.",
  }),
  jorgenNeed({
    id: "dc-jorgen-future-fragment-still",
    scene: "A3/A4, Ryans hånd",
    type: "still",
    person: "Fortæller",
    exactContent:
      "Et iturevet notesidefragment i Ryans hånd med Jørgens håndskrift, fold og sidenummer.",
    delivery: "Nøgtern observation; må ikke endnu kaldes et fremtidsfragment.",
    before: "Jørgen undersøger liget.",
    after: "Fragmentet kan senere sammenlignes med den fysiske notesbog.",
    priority: "nødvendig",
    reuseCandidate:
      "sektorA3-Ryan1 / sektorA3-Ryan2 som baggrund; papiret mangler.",
  }),
  jorgenNeed({
    id: "dc-jorgen-future-fragment-comparison",
    scene: "D3/D4 efter passageeksperimentet",
    type: "still",
    person: "Dokument",
    exactContent:
      "Fragmentet matcher Jørgens bog, mens den tilsvarende side stadig er intakt og fragmentet omtaler senere viden.",
    delivery: "Lagvis sammenligning med tydelig samtidighed og kronologi.",
    before: "Identitet, passagepersistens og fragment er kendt.",
    after: "Fremtidsfragmentet og den senere Jørgen kan udledes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  jorgenNeed({
    id: "dc-jorgen-reset-ambience",
    scene: "Passagen under reset",
    type: "sfx",
    person: "Rumlyd",
    exactContent:
      "Lav forvrænget rumtone, hvor storm, ur og stemmer udenfor springer tilbage, mens lyden i passagen fortsætter.",
    delivery: "Urovækkende og fysisk, men ikke høj eller melodramatisk.",
    before: "Jørgen vælger at blive i passagen.",
    after: "Den ukendte afsløres som en senere Jørgen.",
    priority: "ønskelig",
    reuseCandidate:
      "Clock tick kan indgå, men der findes ingen semantisk dækkende resetlyd.",
  }),
  jorgenNeed({
    id: "dc-jorgen-later-portrait",
    scene: "Passagen efter reset",
    type: "still",
    person: "Jørgen — senere",
    exactContent:
      "Et ældre, udmattet Jørgen-portræt i den mørke passage, samme identitet uden karikatur.",
    delivery: "Skræmmende rolig, slidt og menneskelig.",
    before: "Den ukendte står i passagen.",
    after: "Navnet ændres til Jørgen — senere.",
    priority: "ønskelig",
    reuseCandidate:
      "Et almindeligt Jørgen-billede kan kun bruges mørklagt som teknisk placeholder, hvis identiteten er tydelig i teksten.",
  }),
  jorgenNeed({
    id: "dc-jorgen-special-revelation",
    scene: "C4 gennem reset",
    type: "sequence",
    person: "Jørgen og Jørgen — senere",
    exactContent:
      "Den senere Jørgen forklarer splittet, mordets bootstrap-årsag, sporene som instruktioner og sin tro på, at kun den huskende er virkelig.",
    delivery: "Helt alvorlig; den senere Jørgen er rolig og udmattet, ikke teatralsk.",
    before: "Alle fem tidskonklusioner er opnået.",
    after: "Special revelation, rekonstruktion og paradox-prevention åbnes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  jorgenNeed({
    id: "dc-jorgen-reconstruction-sequence",
    scene: "Sidste morgen",
    type: "sequence",
    person: "Jørgen",
    exactContent:
      "Syv private kort om den umulige gerningsperson, blindpunkt, dobbeltgænger, mordets besked, bootstrap-årsag, fælde og plan.",
    delivery: "Koncentreret, kronologisk og uden at forklare paradokset væk.",
    before: "Mødet med senere Jørgen er afsluttet.",
    after: "Rekonstruktionen gemmes, og decoy-planen åbnes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  jorgenNeed({
    id: "dc-jorgen-decoy-plan",
    scene: "D1/D2, finaleloop",
    type: "still",
    person: "Dokument",
    exactContent:
      "En fysisk falsk plan lover, at den yngre Jørgen venter i gangen og løber mod kantinen ved råbet.",
    delivery: "Troværdig og skrevet i samme stil som de øvrige noter.",
    before: "Rekonstruktionen er gennemført.",
    after: "Den senere Jørgen forventes at handle på den falske rute.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  jorgenNeed({
    id: "dc-jorgen-paradox-prevention",
    scene: "C2, afsatsen",
    type: "sequence",
    person: "Ryan, Jørgen og Jørgen — senere",
    exactContent:
      "Den yngre Jørgen ankommer tidligt fra en anden retning, afbryder skubbet og får den senere Jørgen til at opløses, mens fremtidssiden bliver blank.",
    delivery: "Intellektuel fælde og ontologisk uro; ingen filmet kamp.",
    before: "Decoy-planen er placeret.",
    after: "Ryan lever, og paradokset er brudt.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  jorgenNeed({
    id: "dc-jorgen-epilogue-sequence",
    scene: "Efter paradox-prevention",
    type: "sequence",
    person: "Fortæller",
    exactContent:
      "Ryan lever, loopet brydes, senere Jørgen er væk, de andre husker kun finaledagen, og Jørgen husker den person, han kunne være blevet.",
    delivery: "Rolig, alvorlig og med en rest af ubehag.",
    before: "Den senere Jørgen spørger: Så hvem bliver du nu?",
    after: "Resultatkortet viser to registrerede Jørgener.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
  ryanNeed({
    id: "dc-ryan-fall-sequence",
    scene: "A2, faldøjeblikket",
    type: "sequence",
    person: "Ryan, Laura og Jørgen",
    exactContent:
      "Ryan kalder på Jørgen med halskæden i hånden; Laura og Ryan kæmper; Laura skubber ham væk, og han falder. Det kan ikke ses, hvem der angreb først.",
    delivery:
      "Chokerende og fysisk tydelig, men neutral om ansvar og årsagsretning.",
    before: "Jørgen er i kantinen ved middag.",
    after:
      "Lauras tilstedeværelse og fysiske skub er observeret uden en skyldkonklusion.",
    priority: "nødvendig",
    reuseCandidate:
      "Legacy A2 fastslår Ryans råb og fald, men ikke kampen eller hvem der angreb først.",
  }),
  ryanNeed({
    id: "dc-ryan-body-necklace-still",
    scene: "A3/A4, Ryans hånd",
    type: "still",
    person: "Fortæller",
    exactContent:
      "Ryan ligger efter faldet med Lauras isbjørnehalskæde fastholdt i hånden; et led er revet over, mens låsen er lukket.",
    delivery:
      "Nøgtern kriminalteknisk observation uden at kalde ejeren skyldig.",
    before: "Jørgen undersøger liget.",
    after: "Kædens ejer og afrivningsskaden skal undersøges.",
    priority: "nødvendig",
    reuseCandidate:
      "sektorA3-Ryan1 / sektorA3-Ryan2 kan bruges som baggrund; den præcise kædeskade mangler.",
  }),
  ryanNeed({
    id: "dc-ryan-laura-necklace-injury",
    scene: "Dialog med Laura efter faldet",
    type: "sequence",
    person: "Laura",
    exactContent:
      "Laura identificerer halskæden som sin; et frisk rødt mærke ved halsbenet passer med den voldsomme afrivning.",
    delivery:
      "Bange og tilbageholdende, men faktuel; skaden må ikke seksualiseres eller dramatiseres.",
    before: "Kæden er fundet i Ryans hånd.",
    after: "Den fysiske forbindelse er dokumenteret, men ansvaret er åbent.",
    priority: "nødvendig",
    reuseCandidate:
      "Eksisterende Laura-portræt kan bruges som neutral baggrund; legacy-klip dokumenterer ikke skaden.",
  }),
  ryanNeed({
    id: "dc-ryan-premature-laura-accusation",
    scene: "For tidlig konfrontation med Laura",
    type: "sequence",
    person: "Jørgen og Laura",
    exactContent:
      "Jørgen fremlægger kun ejerskab eller tilstedeværelse; Laura påpeger, at det ikke forklarer, hvordan kæden kom til Ryan eller hvem der angreb først.",
    delivery:
      "Mistanken anerkendes som rationel, men fejlslutningen korrigeres roligt.",
    before: "Spilleren anklager Laura uden hele den fysiske kæde.",
    after: "Efterforskningen fortsætter uden softlock eller falsk finale.",
    priority: "nødvendig",
    reuseCandidate:
      "Peter-BeskyldLaura-klippene afvises, fordi deres semantik antager normal mordskyld.",
  }),
  ryanNeed({
    id: "dc-ryan-laura-partial-admission",
    scene: "Dokumenteret konfrontation med Laura efter faldet",
    type: "sequence",
    person: "Laura og Jørgen",
    exactContent:
      "Laura indrømmer skubbet, forklarer Ryans lokkemad, passage, trussel, angreb og greb i halskæden samt sin frygt for at blive gjort skyldig.",
    delivery:
      "Bange, vred og præcis; sandheden er ikke en mordertilståelse eller automatisk frifindelse.",
    before:
      "Laura er placeret på afsatsen, og halskædens ejerskab, skade og afrivning er dokumenteret.",
    after:
      "Anden efterforskningsfase åbnes med Ryans handlinger før mødet som lead.",
    priority: "nødvendig",
    reuseCandidate:
      "Laura-omAlibi og Peter-BeskyldLaura-klippene afvises; de indeholder ikke den omvendte årsagsretning.",
  }),
  ryanNeed({
    id: "dc-ryan-lure-message",
    scene: "D3/D4, Lauras telefon",
    type: "still",
    person: "Dokument",
    exactContent:
      "Ryans tidsstemplede besked: “Mød mig i læsesalen ved middagstid. Jeg har noget, der tilhører dig. Kom alene.”",
    delivery:
      "Teknisk læsbar og neutral; beskeden alene beviser ikke et mordforsøg.",
    before: "Laura har forklaret mødet.",
    after: "Afsender, tidspunkt og ønsket om at være alene registreres.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  ryanNeed({
    id: "dc-ryan-laura-dossier",
    scene: "D3/D4, Lauras dokumentationsmappe",
    type: "sequence",
    person: "Dokument",
    exactContent:
      "Mappen forbinder Ryans pres mod Barbara, Marie, David og Laura; filhistorikken viser, at Ryan kendte materialet og truede Laura med hendes private fortid.",
    delivery:
      "Dokumentarisk og respektfuld; institutionsopholdet er Ryans våben, aldrig et skyldbevis.",
    before: "Lauras partielle forklaring er kendt.",
    after: "Ryans motiv til at bringe Laura til tavshed kan udledes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  ryanNeed({
    id: "dc-ryan-passage-plan",
    scene: "C3/C4, den skjulte passage",
    type: "still",
    person: "Fortæller",
    exactContent:
      "Voksaftryk fra Ryans taske, en ryddet rute og en kile ved døren viser, at han kendte og forberedte passagen før mødet.",
    delivery:
      "Kriminalteknisk klar og uden at lade selve passagen bevise hele planen.",
    before: "Laura har fortalt, at Ryan førte hende gennem passagen.",
    after: "Mødebesked, alenetid og mordvej kan kombineres.",
    priority: "nødvendig",
    reuseCandidate:
      "sektorC3/C4 kan bruges som neutral baggrund; de nye spor er ikke i legacy-materialet.",
  }),
  ryanNeed({
    id: "dc-ryan-institution-research",
    scene: "B3, Ryans browsercache",
    type: "still",
    person: "Computerinterface",
    exactContent:
      "En gemt institutionsside og søgninger kombinerer Lauras navn med troværdighed, selvmord og adgang til afsatsen.",
    delivery:
      "Teknisk og sobert; UI-teksten skal eksplicit afvise researchens påstand som sand beskrivelse af Laura.",
    before: "Lauras angrebsforklaring er kendt.",
    after: "Den slettede kladde kan gendannes.",
    priority: "nødvendig",
    reuseCandidate:
      "Barbaras legacy-computerflade kan være baggrund, men viser ikke Ryans konto eller research.",
  }),
  ryanNeed({
    id: "dc-ryan-false-suicide-draft",
    scene: "B3, slettet cachefil",
    type: "still",
    person: "Dokument",
    exactContent:
      "Slettet kladde: “Hun havde været dårlig længe. Ingen af os forstod, hvor alvorligt det var.” Den var planlagt til afsendelse efter mødet.",
    delivery:
      "Kold, fabrikeret tekst; fortælleren markerer tydeligt, at den er Ryans løgn.",
    before: "Institutionsresearchen er fundet.",
    after: "Sletning og indhold registreres, men tidspunktet mangler.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  ryanNeed({
    id: "dc-ryan-premeditation-metadata",
    scene: "B3, teknisk sammenligning",
    type: "sequence",
    person: "Computerinterface",
    exactContent:
      "Browserhistorik, kladde, passage-søgning og mødebesked sammenholdes og viser oprettelse og sletning før middag.",
    delivery:
      "Metodisk og forståelig uden unødigt teknisk jargon.",
    before: "Research og slettet kladde er fundet.",
    after: "Den falske selvmordsplan kan udledes som præmediteret.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  ryanNeed({
    id: "dc-ryan-manipulative-denial",
    scene: "Tidlig eller dokumenteret konfrontation med Ryan",
    type: "sequence",
    person: "Ryan og Jørgen",
    exactContent:
      "Ryan kalder beviserne tilfældigheder, siger at Laura overdriver og spørger, hvem gruppen vil tro på.",
    delivery:
      "Kontrolleret og manipulerende uden karikatur; spillet bekræfter ikke hans fremstilling.",
    before: "Jørgen konfronterer den levende Ryan i et senere loop.",
    after:
      "Konfrontationen tælles, men åbner aldrig finalen uden den aktive prevention.",
    priority: "nødvendig",
    reuseCandidate:
      "Ryan-omLaura afvises uden semantisk transskription af den nye trussel.",
  }),
  ryanNeed({
    id: "dc-ryan-reconstruction-sequence",
    scene: "Næste morgen efter ansvarskonklusionen",
    type: "sequence",
    person: "Jørgen",
    exactContent:
      "Otte korte kort om trussel, lokkemad, passage, falsk forklaring, angreb, halskæde, selvforsvarsfald og prevention.",
    delivery:
      "Klar, alvorlig og eksplicit om forskellen mellem fysisk handling og planlagt ansvar.",
    before: "Alle seks kernekonklusioner er opnået.",
    after: "Rekonstruktion og prevention-plan gemmes i notebooken.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  ryanNeed({
    id: "dc-ryan-secure-evidence",
    scene: "B1/B2, finaleloop",
    type: "sequence",
    person: "Jørgen og Barbara",
    exactContent:
      "Mødebesked, telefondata, cache, kladde og tidsstempler eksporteres skrivebeskyttet og sendes til flere modtagere.",
    delivery:
      "Praktisk og troværdig; Barbara hjælper uden at kunne omskrive originalerne.",
    before: "Rekonstruktionen er gennemført.",
    after: "Ryan kan ikke slette beskeden eller den falske fortælling.",
    priority: "nødvendig",
    reuseCandidate:
      "Legacy-computerfladen kan være neutral baggrund; eksporthandlingen er ny.",
  }),
  ryanNeed({
    id: "dc-ryan-warn-laura",
    scene: "E2, finaleloop",
    type: "sequence",
    person: "Laura og Jørgen",
    exactContent:
      "Jørgen viser de sikrede beviser; Laura nægter at blive passiv, og de aftaler, at hun møder Ryan, mens Jørgen går i forvejen.",
    delivery:
      "Laura er bange, vred og handlekraftig; advarslen fratager hende ikke agens.",
    before: "Besked og planfiler er sikret.",
    after: "Laura er informeret, men Ryan skal stadig standses fysisk.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  ryanNeed({
    id: "dc-ryan-prevention-sequence",
    scene: "C2, finaleloop og afsatsen",
    type: "sequence",
    person: "Ryan, Laura og Jørgen",
    exactContent:
      "Ryan gentager truslen og bevæger sig mod Laura; Jørgen træder ud før dødelig fare og fremlægger besked, passage, research, kladde og tidsstempler.",
    delivery:
      "Anspændt og sober; Ryan er farlig, Laura står fast, og ingen falder.",
    before: "Beviserne er sikret, og Laura er advaret.",
    after: "Både Laura og Ryan lever, og loopet brydes.",
    priority: "nødvendig",
    reuseCandidate: null,
  }),
  ryanNeed({
    id: "dc-ryan-epilogue-sequence",
    scene: "Efter prevention",
    type: "sequence",
    person: "Fortæller",
    exactContent:
      "Laura og Ryan overlever; planen afsløres; gruppens øvrige manipulationstråde får kontekst; Lauras institutionsophold afvises som skyldbevis; tiden fortsætter.",
    delivery:
      "Alvorlig og nøgtern uden en for pæn moralsk forløsning.",
    before: "Ryans angreb er afbrudt og beviserne består.",
    after: "Resultatkortet skelner mellem ansvar, fysisk skub og selvforsvar.",
    priority: "ønskelig",
    reuseCandidate: null,
  }),
] as const satisfies readonly DirectorsCutAssetNeed[];

export type DirectorsCutAssetId =
  (typeof DIRECTORS_CUT_ASSET_MANIFEST)[number]["id"];

export function hasDirectorsCutAsset(id: string): boolean {
  return DIRECTORS_CUT_ASSET_MANIFEST.some((entry) => entry.id === id);
}
