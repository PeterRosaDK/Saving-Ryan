# Playtest: Director’s Cut — David

## Start

Projektet kræver Node-versionen fra `.nvmrc`.

```sh
nvm use
npm ci
npm run dev
```

Åbn derefter:

```text
http://localhost:5173/?qa=1
```

Vælg **David-sagen** i den skjulte testmenu og derefter **Director’s Cut**.
Det direkte link `?dcCase=david` virker fortsat. Ingen af parametrene påvirker
**Original historie**. Browserkonsollen bekræfter QA-valget. Uden parameter
vælges en aktiv Director’s Cut-case normalt via registryet.

Production build og lokal production-preview:

```sh
npm run build
npm run preview
```

Den tilsvarende preview-URL er normalt:

```text
http://localhost:4173/?dcCase=david
```

## A. Optimal David-rute — 2 dage

Start med den tvungne URL, vælg Director’s Cut, og gennemfør eller skip introen.

### Dag 1

1. Gå til gangen E1 om morgenen, og vent til middag. Kontrollér, at Laura taber
   halskæden, og at David samler den op.
2. Mens det stadig er middag, gå til grupperummet D2, og undersøg papirkurven.
3. Gå til computerrummet B2, tal med Ryan, og vælg **Hvem er Sarah?**
4. Gå til læsesalen C2, og vent til eftermiddag. Kontrollér, at David følger
   Ryan, og at mulighedskonklusionen registreres.
5. Gå til kantinen A3, og undersøg Ryans hånd og halskæden.
6. Gå tilbage til David i C3, og fremlæg den dokumenterede anklage.
7. Kontrollér tilståelsen, passagen og det nye prevention-lead. Tilståelsen må
   ikke i sig selv give sejr.
8. Lad tiden gå fra C3 til C4 og videre til næste morgen.

### Dag 2

1. Kontrollér den femkort lange private rekonstruktion. Prøv eventuelt at
   springe den over, og kontrollér bagefter, at den kan genlæses i notesbogen.
2. Fra C1: vent til middag.
3. Vælg **Vent ved bogreolen** i C2.
4. Kontrollér prevention-sekvensen, epilogen og resultatkortet:
   David, 2 dage, 3/3 konklusioner og de faktiske anklagetællere.

## B. Kaotisk rute

1. Skip alle skippelige dialoger og sekvenser. Kontrollér, at fakta,
   konklusioner og korte opsummeringer stadig registreres.
2. Anklag mindst én uskyldig og anklag David før alle tre konklusioner.
3. Brug flere loops uden fremdrift, og miss mindst ét C2-prevention-vindue.
4. Kontrollér, at ingen person permanent nægter dialog i David-sagen, at planen
   består gennem loopet, og at notesbogens aktuelle lead fortsat er brugbart.
5. Afslut sagen, og kontrollér resultatkortets konfrontationer, forkerte
   anklager og for tidlige anklager.

## C. Rækkefølge-test

Gentag efterforskningen i mindst to varianter:

- motiv først, halskædebesiddelse derefter, bevægelse sidst;
- halskædefund/pickup først, motiv i et senere loop.

Kontrollér, at pickup plus halskæden i Ryans hånd giver samme konklusion i begge
rækkefølger, og at David først tilstår, når motiv, besiddelse og mulighed alle
er registreret.

## D. Laura-isolation

Behold eventuelt `?dcCase=david` i URL’en, men vælg **Original historie**.

Kontrollér:

- Original historie starter Laura-casen;
- ingen David-konklusioner, QA-fortælling, rekonstruktion eller C2-prevention
  vises;
- originalens dialog, halskæderegel, tilståelse og prevention fungerer som før.

## E. Halskæde-fejlslutningen

1. Find halskæden i Ryans hånd i David-sagen.
2. Få Laura til at bekræfte, at hun ejer den, før pickup-observationen er kendt.
3. Anklag Laura.
4. Kontrollér, at svaret anerkender den forståelige mistanke, men udtrykkeligt
   skelner mellem **ejerskab** og **besiddelse på mordtidspunktet**.
5. Kontrollér, at leadet siger, at gangen før middag skal observeres, og at
   Lauras ejerskab aldrig skaber en Laura-skyldkonklusion.

## Fejlrapport

Notér URL, browser, viewport, dag/tid/rum, seneste handling, om en sekvens blev
skippet, og de synlige notebook-fakta. Ved UI-fejl er et screenshot af hele
stage og notebook særligt nyttigt.
