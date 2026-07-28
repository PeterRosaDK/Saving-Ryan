# Ryan Director’s Cut — playtest

Ryan-sagen kan vælges deterministisk uden at ændre den offentlige
spilleroplevelse:

```sh
nvm use
npm run dev
```

Åbn den viste lokale URL med `?qa=1&dcCase=ryan`, vælg **Ryan** i den skjulte
QA-vælger og derefter **Director’s Cut**. Den direkte parameter
`?dcCase=ryan` er tilstrækkelig, hvis QA-menuen ikke behøves. **Original
historie** skal stadig starte Laura-sagen uanset parameteren.

Den afsluttende production-playtest blev kørt med:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Port 4173 var optaget lokalt, så Vite valgte port 4174. Den faktisk testede URL
var `http://127.0.0.1:4174/?qa=1&dcCase=ryan`.

## Optimal rute — to dage

Dag 1:

1. Bliv i kantinen, og vent gennem A2 og A3. Sekvensen viser Ryan falde efter
   en kamp med Laura, men fastslår ikke, hvem der angreb først.
2. Undersøg Ryan og halskæden. Tal med Laura om halskæden, og konfronter hende
   derefter. Hun indrømmer skubbet og fortæller, at Ryan angreb først; spillet
   fortsætter uden slutning eller forkert-anklage-straf.
3. Gå til gruppen i D3. Vælg **Sikr Ryans besked til Laura** og
   **Gennemgå Lauras dokumentation mod Ryan**.
4. Gå til læsesalen i C3. Vælg **Undersøg Ryans spor i passagen**.
5. Gå til computerrummet i B3. Vælg i rækkefølge
   **Undersøg Ryans research-cache**, **Gendan den slettede kladde** og
   **Sammenlign Ryans tidsstempler**.
6. Notebooken skal nu vise seks af seks kernekonklusioner og skelne mellem
   Lauras fysiske skub, hendes selvforsvar og Ryans planlagte ansvar. Vent til
   næste morgen.

Dag 2:

1. Gennemfør eller skip den otte-korts rekonstruktion. Begge handlinger skal
   gemme samme rekonstruktion og prevention-plan.
2. I B1 vælger du **Sikr beskeden, kladden og metadata**.
3. Gå til gangen, og vent til E2. Tal med Laura, og vælg
   **Jeg ved, hvad Ryan har planlagt**.
4. Gå til læsesalen C2, og vælg
   **Gå gennem passagen og stands Ryan**.
5. Epilogen og resultatkortet skal vise **Sagens ansvarlige: Ryan**,
   **Planlagt offer: Laura**, Lauras fysiske skub,
   **Fysisk dødsårsag i det tidligere loop: Fald under selvforsvar**,
   vurderingen **Selvforsvar**, to reddede personer og én afsløret falsk
   selvmordsfortælling. Det må aldrig kalde Laura morder.

## Negative og rækkefølgeuafhængige kontroller

- Konfrontér Laura efter kun at have set hende på afsatsen eller kun at have
  identificeret halskæden. Mistanken skal afvises som utilstrækkelig uden
  softlock. Gentag efter hele den fysiske kæde; den delvise indrømmelse skal nu
  åbne anden efterforskningsfase.
- Find dossier, besked, passage og computerfund i en anden rækkefølge og på
  forskellige loops. De samme seks konklusioner skal afledes.
- Undlad tidsstempelsammenligningen. Research og kladde alene må ikke bevise
  præmeditation eller fuldt ansvar.
- Konfrontér den levende Ryan i et senere loop. Hans benægtelse er valgfrit
  støttebevis og må ikke afslutte sagen, heller ikke med alle seks
  konklusioner.
- Anklag David, Barbara eller Marie efter faldet. Det skal tælle som en forkert
  anklage uden at låse Laura-ruten.
- Gå til C2 uden begge sikrede bevisklasser eller uden at have advaret Laura.
  Prevention-handlingen må ikke være tilgængelig.
- Miss C2 efter rekonstruktionen. Dagen skal loope normalt, mens planen og den
  permanente viden består.

## Fallback, isolation og layout

Alle 17 Ryan-medier er bevidste tekst-first placeholders i det centrale
Director’s Cut-manifest. Gennemfør både normal afvikling og **Skip** på den
delvise indrømmelse, rekonstruktionen og preventionen; state-effekterne skal
være identiske.

Gentag en kort start med `david`, `barbara`, `marie` og `jorgen`, og kontrollér
at ingen Ryan-interaktioner, Ryan-leads eller Ryan-resultatfelter vises. Start
også **Original historie** og kontrollér Laura-forløbets eksisterende
skyldregler.

Ved ca. 430 px viewport skal QA-vælgeren med fem cases, de lange
interaktionsknapper, notebookens seks konklusioner, rekonstruktionskortene og
resultatfelterne kunne læses uden vandret overflow. Notesbogen skal fortsat
rulle lodret, når listen bliver højere end scenen.
