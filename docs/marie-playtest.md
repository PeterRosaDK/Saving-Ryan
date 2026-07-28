# Playtest: Director’s Cut — Marie

Status: fuldt spilbar tekst-først case. De 17 manglende
produktionsassets er placeholders i det centrale
`src/media/directorsCutAssetManifest.ts`.

## Start og QA

Brug Node-versionen fra `.nvmrc`:

```sh
nvm use
npm ci
npm run dev
```

Vites faktiske standardport er `5173`. Åbn:

```text
http://localhost:5173/?qa=1
```

Vælg **Marie-sagen** og derefter **Director’s Cut**. Det direkte QA-link er:

```text
http://localhost:5173/?dcCase=marie
```

Production build og lokal preview:

```sh
npm run build
npm run preview
```

Preview bruger normalt:

```text
http://localhost:4173/?dcCase=marie
```

## Optimal rute — 2 dage

### Dag 1

1. Gå til E1, og vent til middag. Overvær, at Ryan tager Maries side og truer
   med at fjerne hendes navn.
2. Gå til D2. Undersøg Maries projektmappe, og spørg hende, hvad Ryan ellers
   truede med.
3. Vent i D2. Marie forlader grupperummet før skriget.
4. Spørg Marie i D3 om hendes alibi.
5. Undersøg Ryans hånd i A3, og spørg Laura, om hun så Marie vende tilbage.
6. Sammenlign fragmentet med Maries mappe i D3.
7. Undersøg støvet ved bogreolen i C3.
8. Kontrollér fire af fire kernekonklusioner, og konfronter Marie i D3.
9. Lad aftenen gå til næste morgen.

### Dag 2

1. Læs eller skip den private syvkorts-rekonstruktion.
2. Vælg **Sikr Maries arbejde foran gruppen** i D1.
3. Gå til C1, vent til C2, og vælg **Stands Marie ved passagen**.
4. Kontrollér epilog og resultatkort: Marie, 2 dage, 4/4 konklusioner og de
   faktiske anklagetællere.

## Kaotisk rute og gating

- Find papirfragmentet før motivet, eller lær passageviden i C1 på et tidligere
  loop. Konklusionerne skal være de samme uanset rækkefølge.
- Anklag Laura, David og Barbara. Anklag Marie før hver af de fire
  beviskategorier er færdig. Alle afvisninger skal bevare dialog og et brugbart
  lead.
- Et fragment alene må ikke bevise motiv, adgang eller fysisk kontakt.
- Skip alle nye tekstkort. De samme facts, tilståelses-effects og finalestate
  skal registreres.
- Miss C2 efter rekonstruktionen. Planen og det sikrede arbejde skal bestå til
  næste loop.
- Forsøg prevention før arbejdet er sikret. Handlingen må ikke være klikbar og
  en direkte reducer-dispatch må afvises.

## Isolation og fallback

- Start **Original historie** med `?dcCase=marie`; Laura skal stadig vælges.
- Start `?dcCase=david` og `?dcCase=barbara`; ingen Marie-interaktioner,
  konklusioner eller finaler må være tilgængelige.
- Alle nye cues er autoritative tekstfallbacks med stabile manifest-ID’er. Et
  skip giver de samme knowledge-effects som fuld visning.
- Test 390–430 px viewport. Stage må skalere, notesbogen skal bruge normal
  sidescroll, og rekonstruktionskortene skal kunne læses uden vandret scroll.

## Kendte placeholders

Der genereres ingen nye billeder, stemmer eller videoer i denne fase. Se
Marie-sektionen i `docs/directors-cut-asset-manifest.md` for alle 17 behov,
semantiske genbrugsbeslutninger og den autoritative fallbacktekst.
