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
  caseId: "david";
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
] as const satisfies readonly DirectorsCutAssetNeed[];

export type DirectorsCutAssetId =
  (typeof DIRECTORS_CUT_ASSET_MANIFEST)[number]["id"];

export function hasDirectorsCutAsset(id: string): boolean {
  return DIRECTORS_CUT_ASSET_MANIFEST.some((entry) => entry.id === id);
}
