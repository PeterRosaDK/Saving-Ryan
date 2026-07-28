# Director’s Cut og fælles Legacy — manglende assets

Den autoritative, maskinlæsbare liste er
`src/media/directorsCutAssetManifest.ts`. Tekstfallbacks er allerede integreret
og fuldt spilbare.

Manifestet rummer aktuelt 93 placeholders: 71 nødvendige og 22 ønskelige.
Fordelingen er 23 stillbilleder, 23 voice-klip, 46 redigerede sekvenser og ét
lyddesign-klip. Fem af de 93 tilhører Original-historien; resten fordeler sig
på David (16), Barbara (20), Marie (17), Jørgen (18) og Ryan (17).

Et `still` kan normalt løses som ét komponeret billede, og `voice` som lyd over
en eksisterende visuel fallback. Et `sequence` er derimod et produktionsbehov:
det kan godt udføres som en motion-comic med AI-billeder, stemmer og lyddesign,
men kræver flere kontinuitetsbevidste billeder, timing og redigering. Dokument-
og computerstills bør sættes typografisk i hånden, så de forbliver læsbare;
`dc-jorgen-reset-ambience` er rent lyddesign. Manifestet forudsætter ikke
syntetiske kopier af de oprindelige skuespillerstemmer.

## Original historie / fælles Legacy

| Asset-ID | Scene | Type | Person | Prioritet | Genbrug | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `legacy-laura-e1-bullying-still` | E1 | still | Ryan/Marie | nødvendig | eksisterende E1-still er tomt og kun egnet som baggrund | placeholder |
| `legacy-laura-sarah-question-voice` | Ryan-dialog | voice | Jørgen | ønskelig | intet godkendt spørgsmålsklip | placeholder |
| `legacy-laura-confession-sequence` | Laura-konfrontation | sequence | Laura/Jørgen | nødvendig | ingen færdig tilståelsessekvens | placeholder |
| `legacy-laura-prevention-sequence` | C1-finalen | sequence | Jørgen/Laura/Ryan | nødvendig | eksisterende C1-still kan indgå som baggrund | placeholder |
| `legacy-laura-epilogue-sequence` | epilog | sequence | Fortæller | ønskelig | eksisterende A1-baggrund kan indgå | placeholder |

De fem punkter ovenfor er de eneste registrerede mangler til den fuldt spilbare
Original-historie. E1-scenen er tekstbaseret, så det nødvendige stillbillede kan
tilføjes senere uden at ændre knowledge-effekten.

## David

| Asset-ID | Scene | Type | Person | Prioritet | Genbrug | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `dc-david-letter-still` | D1–D4 | still | Fortæller | ønskelig | eksisterende brevstills | placeholder |
| `dc-david-ryan-sarah-voice` | Ryan-dialog | voice | Ryan | nødvendig | Ryan-omSara… afvist semantisk | placeholder |
| `dc-david-marie-breakup-voice` | Marie-dialog | voice | Marie | ønskelig | ingen | placeholder |
| `dc-david-hall-necklace-sequence` | E1 | sequence | Laura/David | nødvendig | ingen | placeholder |
| `dc-david-reading-room-follow-sequence` | C2 | sequence | Fortæller | ønskelig | legacytekst som grundlag | placeholder |
| `dc-david-body-necklace-still` | A3/A4 | still | Fortæller | ønskelig | eksisterende bodystills | placeholder |
| `dc-david-laura-necklace-voice` | Laura-dialog | voice | Laura | nødvendig | ingen | placeholder |
| `dc-david-alibi-voice` | David-dialog | voice | David | nødvendig | legacy-alibi ikke godkendt | placeholder |
| `dc-david-followup-lie-voice` | David-opfølgning | voice | David | ønskelig | ingen | placeholder |
| `dc-david-laura-wrong-accusation` | forkert Laura-anklage | voice | Jørgen/Laura | nødvendig | ingen | placeholder |
| `dc-david-suspicions-dialogue` | post-murder-dialog | voice | gruppen | ønskelig | legacy-klip ikke godkendt | placeholder |
| `dc-david-accusation-sequence` | konfrontation | sequence | Jørgen/David | nødvendig | ingen | placeholder |
| `dc-david-confession-voice` | tilståelse | voice | David | nødvendig | ingen | placeholder |
| `dc-david-reconstruction-sequence` | sidste morgen | sequence | Jørgen | nødvendig | ingen | placeholder |
| `dc-david-prevention-sequence` | C2-finalen | sequence | Jørgen/David/Ryan | nødvendig | ingen | placeholder |
| `dc-david-epilogue-sequence` | epilog | sequence | Fortæller | ønskelig | ingen | placeholder |

## Barbara

| Asset-ID | Scene | Type | Person | Prioritet | Genbrug | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `dc-barbara-morning-necklace-sequence` | A1 | sequence | Laura/Barbara | nødvendig | ingen | placeholder |
| `dc-barbara-intruder-dialogue` | David-dialog | voice | David | nødvendig | Legacy Fresh-spor | placeholder |
| `dc-barbara-blackmail-sequence` | B2 | sequence | Ryan/Barbara | nødvendig | ingen | placeholder |
| `dc-barbara-computer-grade-screen` | B2/B3 | still | computer | nødvendig | Legacy computerflade | placeholder |
| `dc-barbara-computer-recent-files` | B2/B3 | still | computer | nødvendig | ingen | placeholder |
| `dc-barbara-building-plan-screen` | B2/B3 | still | computer | nødvendig | legacy-tegningsmateriale | placeholder |
| `dc-barbara-laura-missing-necklace` | Laura-dialog | voice | Laura | nødvendig | ingen | placeholder |
| `dc-barbara-body-necklace-still` | A3/A4 | still | fortæller | nødvendig | eksisterende bodystills | placeholder |
| `dc-barbara-reading-room-route-sequence` | B2/C2 | sequence | Barbara/Ryan | nødvendig | ingen | placeholder |
| `dc-barbara-alibi-dialogue` | Barbara-dialog | voice | Barbara | nødvendig | ingen | placeholder |
| `dc-barbara-helper-sequence` | hjælpedialog | sequence | Barbara/Jørgen | nødvendig | hackerklip kun efter semantisk kontrol | placeholder |
| `dc-barbara-timestamp-comparison` | B2/B3 | sequence | Jørgen | nødvendig | ingen | placeholder |
| `dc-barbara-marie-bag-dialogue` | Marie-dialog | voice | Marie | ønskelig | ingen | placeholder |
| `dc-barbara-david-movement-dialogue` | David-dialog | voice | David | ønskelig | ingen | placeholder |
| `dc-barbara-suspicions-dialogue` | post-murder-dialog | voice | gruppen | ønskelig | legacy-klip ikke godkendt | placeholder |
| `dc-barbara-accusation-sequence` | konfrontation | sequence | Jørgen/Barbara | nødvendig | ingen | placeholder |
| `dc-barbara-confession-voice` | tilståelse | voice | Barbara | nødvendig | ingen | placeholder |
| `dc-barbara-reconstruction-sequence` | sidste morgen | sequence | Jørgen | nødvendig | ingen | placeholder |
| `dc-barbara-prevention-sequence` | C2-finalen | sequence | Jørgen/Barbara/Ryan | nødvendig | ingen | placeholder |
| `dc-barbara-epilogue-sequence` | epilog | sequence | fortæller | ønskelig | ingen | placeholder |

Manifestet indeholder desuden præcis replik/billedbeskrivelse, levering,
kontekst før/efter og case-ID for hvert behov.

## Marie

| Asset-ID | Scene | Type | Person | Prioritet | Genbrug | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `dc-marie-morning-humiliation-sequence` | E1 | sequence | Marie/Ryan | nødvendig | legacy E1 som semantisk grundlag | placeholder |
| `dc-marie-work-folder-sequence` | D1–D4 | still | dokument | nødvendig | ingen | placeholder |
| `dc-marie-work-dialogue` | Marie-dialog | voice | Marie | ønskelig | ingen | placeholder |
| `dc-marie-threat-dialogue` | Marie-dialog | voice | Marie | nødvendig | legacy-fortrolighed afvist semantisk | placeholder |
| `dc-marie-passage-discovery-sequence` | C1 | sequence | Marie | nødvendig | neutral læsesalsbaggrund | placeholder |
| `dc-marie-leaves-group-sequence` | D2 | sequence | Marie | nødvendig | legacy D2 som semantisk grundlag | placeholder |
| `dc-marie-alibi-dialogue` | Marie-dialog | voice | Marie | nødvendig | legacy-alibi ikke godkendt | placeholder |
| `dc-marie-body-fragment-still` | A3/A4 | still | fortæller | nødvendig | eksisterende bodystills som baggrund | placeholder |
| `dc-marie-torn-page-comparison` | D3/D4 | still | dokument | nødvendig | ingen | placeholder |
| `dc-marie-dust-witness-dialogue` | Laura-dialog | voice | Laura | ønskelig | ingen | placeholder |
| `dc-marie-passage-trace-sequence` | C3/C4 | still | fortæller | nødvendig | neutral læsesalsbaggrund | placeholder |
| `dc-marie-accusation-sequence` | konfrontation | sequence | Jørgen/Marie | nødvendig | ingen | placeholder |
| `dc-marie-confession-voice` | tilståelse | voice | Marie | nødvendig | ingen | placeholder |
| `dc-marie-reconstruction-sequence` | sidste morgen | sequence | Jørgen | nødvendig | ingen | placeholder |
| `dc-marie-secure-work-sequence` | D1/D2-finalen | sequence | gruppen | nødvendig | ingen | placeholder |
| `dc-marie-prevention-sequence` | C2-finalen | sequence | Jørgen/Marie/Ryan | nødvendig | ingen | placeholder |
| `dc-marie-epilogue-sequence` | epilog | sequence | fortæller | ønskelig | ingen | placeholder |

## Jørgen

| Asset-ID | Scene | Type | Person | Prioritet | Genbrug | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `dc-jorgen-murder-call-sequence` | A2 | sequence | Ryan/Jørgen/ukendt | nødvendig | legacy A2 som grundlag | placeholder |
| `dc-jorgen-previous-loop-note` | D1–D4 | still | dokument | nødvendig | ingen | placeholder |
| `dc-jorgen-login-audit` | B1–B3 | still | computer | nødvendig | neutral legacy-computerflade | placeholder |
| `dc-jorgen-lookalike-witness` | Marie-dialog | voice | Marie | nødvendig | ingen | placeholder |
| `dc-jorgen-npc-alibi-dialogue` | post-murder-dialog | voice | gruppen | ønskelig | legacy-klip ikke godkendt | placeholder |
| `dc-jorgen-wrong-accusation` | NPC-anklage | sequence | Jørgen/NPC | nødvendig | ingen | placeholder |
| `dc-jorgen-alibi-review` | D3/D4 | sequence | Jørgen | ønskelig | ingen | placeholder |
| `dc-jorgen-passage-test` | C1–C4 | sequence | Jørgen | nødvendig | neutral læsesalsbaggrund | placeholder |
| `dc-jorgen-passage-persistence` | C1–C4 efter reset | still | fortæller | nødvendig | neutral læsesalsbaggrund | placeholder |
| `dc-jorgen-future-fragment-still` | A3/A4 | still | fortæller | nødvendig | eksisterende bodystills som baggrund | placeholder |
| `dc-jorgen-future-fragment-comparison` | D3/D4 | still | dokument | nødvendig | ingen | placeholder |
| `dc-jorgen-reset-ambience` | passagen under reset | sfx | rumlyd | ønskelig | clock tick utilstrækkelig alene | placeholder |
| `dc-jorgen-later-portrait` | passagen | still | Jørgen — senere | ønskelig | mørklagt Jørgen kun som placeholder | placeholder |
| `dc-jorgen-special-revelation` | C4/reset | sequence | to Jørgener | nødvendig | ingen | placeholder |
| `dc-jorgen-reconstruction-sequence` | sidste morgen | sequence | Jørgen | nødvendig | ingen | placeholder |
| `dc-jorgen-decoy-plan` | D1/D2 | still | dokument | nødvendig | ingen | placeholder |
| `dc-jorgen-paradox-prevention` | C2/afsatsen | sequence | Ryan/to Jørgener | nødvendig | ingen | placeholder |
| `dc-jorgen-epilogue-sequence` | epilog | sequence | fortæller | ønskelig | ingen | placeholder |

## Ryan

| Asset-ID | Scene | Type | Person | Prioritet | Genbrug | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `dc-ryan-fall-sequence` | A2 | sequence | Ryan/Laura/Jørgen | nødvendig | legacy råb/fald kun som geografisk grundlag | placeholder |
| `dc-ryan-body-necklace-still` | A3/A4 | still | fortæller | nødvendig | eksisterende bodystills som baggrund | placeholder |
| `dc-ryan-laura-necklace-injury` | Laura-dialog | sequence | Laura | nødvendig | neutralt Laura-portræt | placeholder |
| `dc-ryan-premature-laura-accusation` | for tidlig Laura-anklage | sequence | Jørgen/Laura | nødvendig | legacy-anklage afvist semantisk | placeholder |
| `dc-ryan-laura-partial-admission` | dokumenteret Laura-konfrontation | sequence | Laura/Jørgen | nødvendig | legacy-klip afvist semantisk | placeholder |
| `dc-ryan-lure-message` | D3/D4 | still | dokument | nødvendig | ingen | placeholder |
| `dc-ryan-laura-dossier` | D3/D4 | sequence | dokument | nødvendig | ingen | placeholder |
| `dc-ryan-passage-plan` | C3/C4 | still | fortæller | nødvendig | neutral læsesalsbaggrund | placeholder |
| `dc-ryan-institution-research` | B3 | still | computerinterface | nødvendig | neutral legacy-computerflade | placeholder |
| `dc-ryan-false-suicide-draft` | B3 | still | dokument | nødvendig | ingen | placeholder |
| `dc-ryan-premeditation-metadata` | B3 | sequence | computerinterface | nødvendig | ingen | placeholder |
| `dc-ryan-manipulative-denial` | Ryan-dialog | sequence | Ryan/Jørgen | nødvendig | legacy-klip afvist semantisk | placeholder |
| `dc-ryan-reconstruction-sequence` | sidste morgen | sequence | Jørgen | nødvendig | ingen | placeholder |
| `dc-ryan-secure-evidence` | B1/B2-finalen | sequence | Jørgen/Barbara | nødvendig | neutral legacy-computerflade | placeholder |
| `dc-ryan-warn-laura` | E2-finalen | sequence | Laura/Jørgen | nødvendig | ingen | placeholder |
| `dc-ryan-prevention-sequence` | C2/afsatsen | sequence | Ryan/Laura/Jørgen | nødvendig | ingen | placeholder |
| `dc-ryan-epilogue-sequence` | epilog | sequence | fortæller | ønskelig | ingen | placeholder |
