# Audio asset audit

This audit separates the original legacy baseline, the later recovered Director
working copy, and the browser implementation. The later source is the readable
`Legacy Fresh/Spillet/spillet_decompiled.dir`; the compiled `spillet.dir` is used
only as a structural control.

## Recovered audio

| Source | Web asset | Format | Duration |
| --- | --- | --- | ---: |
| `Legacy/Intro.dir`, cast member `intro` | `public/assets/audio/intro.wav` | 44.1 kHz mono PCM WAV | 30.444 s |
| `Legacy Fresh/Spillet/Musik/28.wav` | `public/assets/audio/music/28.wav` | 44.1 kHz mono PCM WAV | 23.228 s |
| `Legacy Fresh/Spillet/Musik/29.wav` | `public/assets/audio/music/29.wav` | 44.1 kHz mono PCM WAV | 52.138 s |
| `Legacy Fresh/Spillet/Musik/31.wav` | `public/assets/audio/music/31.wav` | 44.1 kHz mono PCM WAV | 56.142 s |
| `Legacy Fresh/Spillet/Musik/34.wav` | `public/assets/audio/music/34.wav` | 44.1 kHz mono PCM WAV | 24.688 s |
| `Legacy Fresh/Spillet/Musik/35.wav` | `public/assets/audio/music/35.wav` | 44.1 kHz mono PCM WAV | 17.164 s |
| `Legacy Fresh/Spillet/Musik/36.wav` | `public/assets/audio/music/36.wav` | 44.1 kHz mono PCM WAV | 15.611 s |
| `Legacy Fresh/Spillet/Musik/37.wav` | `public/assets/audio/music/37.wav` | 44.1 kHz mono PCM WAV | 16.736 s |
| `Legacy Fresh/Spillet/Musik/38.wav` | `public/assets/audio/music/38.wav` | 44.1 kHz mono PCM WAV | 14.808 s |
| `Legacy Fresh/Spillet/Musik/clock_tick.wav` | `public/assets/audio/effects/clock_tick.wav` | 11.025 kHz mono PCM WAV | 9.617 s |

The web copies are byte-preserving source masters, not enhanced derivatives.
Tests validate every file's presence and byte size. The intro WAV remains a
lossless extraction of Director's split `sndH`/`sndS` member.

Archival SHA-256 values:

```text
intro  72fb5b48484cbc199dc247538efa519aeaeb8b36ee31755e7c7acee35372db7f
28     a9ad847ab0ffab5198cf39f783164fd2c7f30ba401adc69b859a89163f61a0e3
29     703e04e9346700741b92823607fc6c0a6ed5f13506b1e7ca291783642469af42
31     1e3e9d9faba120eb69f0281fb07e7cef465758817bd2ccec3f1ecfa0cde511c4
34     22915cfd4c50f91dc8f335f6da17f87f5161af1888d2caf4728239ecf5e360fe
35     e4655a73e13f6c457b8c50a299d32219a15fd1f8bee9b2592648af1ed676a3cc
36     a0c3caae7d08388e0d45f1f886d7f59c5cc35ce12f8f0f4d8659865a3b68bd7c
37     6f510b4df13ef2ea2f218a9b7abecfa41a042a1ea74a6c2ddd4e6164c7759b54
38     f3e129a0dfc337b70c53869ca0b118f4a961b328f5c5a59384d52736466ac396
clock  bd1c646c4e3fe6309ec7b21f313f9af0049468f41d621696545f2174949cb6a6
```

## What the later Director source proves

The later main movie has eight music cast members, numbered 81–88, and the clock
sound as member 89. Its decompiled Lingo adds:

- a music on/off control;
- fade-down before question/answer and special media;
- fade-up when the media sequence returns to the room;
- a clock sound control.

This proves that the eight WAV files belong to the game and that continuous
music with dialogue ducking was intended.

It does **not** preserve a reliable room-to-track assignment. A direct audit of
`spillet_decompiled.dir` found no command that starts a named music member, and
both sound channels in the saved score are empty for all 170 frames. The
compiled control has matching score and Lingo content. Track numbers therefore
cannot honestly be labelled “canteen”, “computer room”, and so on from the
available Director data alone.

## Browser mapping

The browser implementation keeps the uncertainty in one replaceable table:

| Location | Provisional track |
| --- | --- |
| A — Kantinen | `28` |
| B — Computerrummet | `29` |
| C — Læsesalen | `31` |
| D — Grupperummet | `34` |
| E — Gangarealet | `35` |

Tracks `36`, `37`, and `38` remain preserved but deliberately unmapped. This is
a production reconstruction, not recovered legacy truth. Changing the five
entries in `src/media/musicManifest.ts` changes the whole game consistently
without touching scene or state logic.

Location music loops during exploration, follows the player's current room, can
be toggled with the recovered note button, and is attenuated while dialogue or a
special narrative cue plays. The recovered clock sound plays when time is
advanced.

## Video audio

All 81 MP4 files contain their original production audio. The corresponding 81
AVIs in `Legacy Fresh` have the same basenames and matching durations; the later
folder contains no newly recorded live-action scene. The four `Peter-Gang*`
tracks remain walking/location production sound rather than separate music
masters.

## Suno workflow

Keep `28.wav` through `38.wav` unchanged as archival masters. When a track is
improved in Suno:

1. preserve the numbered original;
2. export the enhanced version under a new stable filename;
3. record which original supplied its composition;
4. update only the declarative mapping;
5. retain rights/provenance notes beside the derivative.

Before enhancement, a human listening pass should name the eight compositions
and decide whether `36`–`38` are alternatives, transitions, or intended room
tracks. That is the remaining authoritative mapping gap.
