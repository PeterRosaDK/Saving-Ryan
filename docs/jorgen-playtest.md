# Playtest: Director’s Cut — Jørgen

Status: fuldt spilbar tekst-først paradoxcase. De 18 manglende
produktionsassets er placeholders i
`src/media/directorsCutAssetManifest.ts`.

## Start og QA

```sh
nvm use
npm ci
npm run dev
```

Vites faktiske standardport er `5173`. Brug den skjulte vælger:

```text
http://localhost:5173/?qa=1
```

Vælg **Jørgen-sagen** og derefter **Director’s Cut**. Det direkte link er:

```text
http://localhost:5173/?dcCase=jorgen
```

Production build og preview:

```sh
npm run build
npm run preview
```

Preview bruger normalt:

```text
http://localhost:4173/?dcCase=jorgen
```

Den afsluttende automatiserede 430 px-browserkontrol brugte port `4174`,
fordi `4173` allerede var optaget lokalt.

## Optimal rute — 4 dage

### Dag 1: et faktisk tidligere loop

1. Bliv i A1 og lad tiden gå til middag.
2. Vent i A2. Ryan kalder specifikt på Jørgen med papiret og bliver skubbet.
3. Undersøg fragmentet i Ryans hånd i A3.
4. Gennemfør resten af dagen. Det registrerede A1–A4-forløb skal bevares som
   reference, ikke som fysisk dagsstate.

### Dag 2: hukommelse, identitet og eksperiment

1. Læs den anonyme besked i D1. Den skal henvise til gårsdagens faktiske rute.
2. Kontrollér loginloggen i B1.
3. Spørg Marie i D1, om hun så nogen ved læsesalen. Konklusionen skal fortsat
   ligne framing, ikke tidsduplikation.
4. Gå til C1, åbn passagen, og placér det daterede mærke samt kontrollen
   udenfor.
5. Gennemfør dagen. Passagekonklusionen må ikke komme før reset.

### Dag 3: persistens, fremtidsfragment og afsløring

1. Kontrollér eksperimentet i C1. Mærket inde består; kontrollen udenfor er
   nulstillet.
2. Lad tiden gå til eftermiddag, og sammenlign fragmentet med notesbogen i D3.
3. Kontrollér den lagdelte notebook:
   fremtidsfragment → mulig senere Jørgen →
   **Morderen er mig — men ikke endnu.**
4. Gå til C4, og vælg **Bliv i passagen, mens dagen nulstilles**.
5. Læs eller skip mødet med **Jørgen — senere**.

### Dag 4: paradox-prevention

1. Læs eller skip den private syvkorts-rekonstruktion.
2. Placér den falske plan i D1.
3. Gå til C1, vent til C2, og vælg den tidligere passagehandling.
4. Kontrollér at Ryan lever, fremtidssiden bliver blank, den senere Jørgen
   opløses, og sidste replik er: **Så hvem bliver du nu?**
5. Resultatkortet skal vise Jørgen (senere), 4 dage, fem kernekonklusioner,
   `Registrerede Jørgener: 2` og `Tidsmæssige selvmodsigelser: 1`.

## Case bible: tidsreglen

Passagen er et fysisk blindpunkt for reset. En krop eller genstand, som befinder
sig helt inde i passagen i resetøjeblikket, bliver ikke nulstillet. Verden
genskaber stadig næste morgens Jørgen udenfor. Den kanoniske duplikation sker
præcis én gang; den senere Jørgen undgår derefter at skabe flere kopier.

Mordet har ingen oprindelig første årsag. Den senere Jørgen dræber Ryan foran
den yngre for at skabe ønsket om at få dagen tilbage. Efterforskningens spor er
instruktioner, som skal føre den yngre til det passageophold, der skaber den
senere. Preventionen bryder kæden ved at udnytte den ældres tro på perfekt
forudviden.

## Kaotisk rute og gating

- Forsøg at læse noten på første dag. Handlingen må ikke være tilgængelig.
- Lær kun login eller kun Maries observation. Identitetskonklusionen må kræve
  begge samt Jørgens eget alibi.
- Placér passageobjektet, og kontrollér igen samme dag. Persistens må først
  verificeres efter reset.
- Find fragmentet tidligt. Den intakte side og fremtidsviden må ikke kunne
  udledes før passage- og identitetslagene.
- Anklag Laura, David, Barbara og Marie. Alle fire skal tælle og afvises uden
  dialog-softlock. Der må aldrig findes en tidlig **anklag Jørgen**-knap.
- Forsøg den særlige passagehandling før slutkonklusionen og prevention før
  decoy-planen. Direkte reducer-dispatch skal også afvises.
- Skip alle tekstsekvenser. De samme knowledge-, finale- og reset-effects skal
  anvendes; ingen medieplaceholder må blokere.

## Isolation og smal viewport

- Original historie skal ignorere `?dcCase=jorgen` og bruge Laura.
- David, Barbara og Marie må ikke udlede Jørgen-konklusioner, bevare
  passageobjektet eller vise paradoxstatistik.
- Start et nyt spil efter finalen. Tidligere-loop-reference, eksperiment,
  konklusioner, decoy og finale-state skal være tomme.
- Test ved 390–430 px. Den lange special revelation, rekonstruktionen,
  notebooken og resultatkortets ekstra rækker skal bruge lodret scroll uden
  vandret overflow.

## Kendte placeholders

Der er ikke genereret billeder, stemmer eller video. Se Jørgen-sektionen i
`docs/directors-cut-asset-manifest.md` for alle 18 behov, følelsesmæssig
levering, kontekst og semantiske genbrugsbeslutninger.
