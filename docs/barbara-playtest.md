# Playtest: Director’s Cut — Barbara

Status: implementeret som tekst-først playtestcase. Manglende
produktionsmedier er placeholders i det centrale
`src/media/directorsCutAssetManifest.ts`.

## Målrettet start

Brug:

```text
/?dcCase=barbara
```

Vælg derefter **Director’s Cut**. Den fulde lokale URL er normalt
`http://localhost:5173/?dcCase=barbara`; produktionsvarianten er
`https://ryan.petergpt.dk/?dcCase=barbara`.

Query-parameteren går gennem det generiske registry. Uden parameter vælges
uniformt mellem de aktive `david`- og `barbara`-cases. **Original historie**
starter altid Laura, også med parameteren i URL’en.

## Hurtigste verificerede rute — 3 dage

### Dag 1

1. Gå til B1 og observer Barbaras computerfærdigheder.
2. Gå tilbage til A1 og vent: Laura lægger halskæden i tasken, og Barbara er
   den sidste ved tingene.
3. Tal med Laura i E2 om den manglende halskæde.
4. I B2: aflyt Ryans afpresning af Barbara, og vent derefter, så de forlader
   rummet sammen.
5. Undersøg Ryans hånd i A3.
6. Få Barbaras alibi i D3.
7. Vent til D4, gå til B4, og vent ind i næste morgen for at registrere Lauras
   skjulte computeraktivitet.

### Dag 2

1. Spørg David i D1 om computere og få `Intruder`.
2. Vent i B1 til B2, log ind på Barbaras computer, og gennemgå karakterfiler og
   nylige filer. Undersøg bygningstegningen i B3.
3. Bed Barbara i D3 om at undersøge Laura. Notér, at privathistorikken ikke er
   skyldbevis, og at hun præsenterer billedet som nyt.
4. Gå tilbage til B3 og vælg **Sammenlign tidsstempler**.
5. Konfronter Barbara i D3. Tilståelsen afslutter ikke spillet.
6. Vent ind i næste morgen.

### Dag 3

1. Læs eller skip den private sekskorts-rekonstruktion.
2. Gå til C1, vent til C2, og vælg **Vent ved bogreolen**.
3. Kontrollér, at Jørgen griber Barbara før skubbet, at Ryan lever, og at
   resultatkortet viser Barbara og `4/4`.

## Variations- og isolationstjek

- Find motiv, passage og manipulation i andre rækkefølger og på tværs af loops.
- Find computerens tidsstempler før ligets halskæde.
- Find halskædesporet først og karakterfilerne i et senere loop.
- Skip alle nye dialoger; facts og skip-resuméer skal stadig gøre ruten mulig.
- Anklag Laura og David fejlagtigt og fortsæt.
- Anklag Barbara før fire konklusioner og fortsæt.
- Få tilståelsen, men miss C2 én gang; planen skal bestå til næste loop.
- Start et nyt Original-spil og kontrollér, at ingen Barbara-viden følger med.
- Start `?dcCase=david`; pickup, tre David-konklusioner og David-finalen skal
  være uændrede.
- Prøv deterministiske selection-værdier i tests: lav værdi vælger David, høj
  værdi vælger Barbara.

Særligt playtestfokus: om A1-morgenobservationen bliver fundet naturligt, om
den tidskrævende første computerundersøgelse føles tydelig, og om leadet efter
Barbaras falske hjælp gør tidsstempelhandlingen nem at finde.
