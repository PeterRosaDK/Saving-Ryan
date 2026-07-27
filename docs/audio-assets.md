# Audio asset audit

This audit distinguishes audio that is present in the supplied project from
music described by memory or the project report. It is based on all four
Director files, the 81 supplied video files, `Legacy/Projektet.pdf`, and the
repository's complete Git history.

## Recovered Director sound

| Source | Cast member | Extracted file | Format | Duration |
| --- | --- | --- | --- | --- |
| `Legacy/Intro.dir` | `intro` | `public/assets/audio/intro.wav` | 44.1 kHz, mono WAV | 30.444 s |

The WAV is a lossless extraction of the split Director `sndH`/`sndS` sound
member. It can be reproduced with the `saving_ryan_extract_sounds` utility
documented under `tools/director/`; its expected SHA-256 is:

```text
72fb5b48484cbc199dc247538efa519aeaeb8b36ee31755e7c7acee35372db7f
```

The other three Director files contain no sound cast members:

- `Legacy/Spillet.dir`: 0 embedded sounds;
- `Legacy/Video.dir`: 0 embedded sounds;
- `Legacy/Billeder.dir`: 0 embedded sounds.

The recovered Lingo has one sound call, `puppetSound("intro")`. No Lingo call
or score reference to location music was found.

## Music mentioned by the report

Page 27 of `Legacy/Projektet.pdf` says that the sound was sparse, that “a
couple of individual pieces” had been composed, and that they had so far only
been recorded on one instrument rather than fully arranged. The report does
not name the pieces or assign them to locations.

This is evidence that more than one composition existed during production. It
is not evidence that the additional compositions were included in the supplied
Director build. Only `intro` survives in the files currently available.

## Video audio

All 81 MP4 files contain their production audio. These are dialogue and
live-action sequence soundtracks, not separate music masters.

The four otherwise-unused `Peter-Gang*` members were checked specifically
because their names correspond to movement toward the four rooms:

| Video | Duration | Finding |
| --- | ---: | --- |
| `Peter-GangGruppe.mp4` | 1.209 s | walking/location production sound |
| `Peter-GangKantine.mp4` | 7.752 s | walking/location production sound |
| `Peter-GangLab.mp4` | 2.543 s | walking/location production sound |
| `Peter-GangLaese.mp4` | 2.918 s | walking/location production sound |

Their mono AAC tracks are very quiet location noise and do not exhibit the
harmonic structure of the recovered intro piece. Extracting them as “music”
would create misleading source assets. The original MP4 files remain unchanged,
and their AAC tracks can be demuxed later if the ambience is useful.

## What is missing

No standalone WAV, AIFF, MIDI, MP3, Director sound member, or historical Git
object for separate canteen, computer-room, reading-room, group-room, or
corridor music exists in the supplied material.

Likely recovery sources, in order of value, are:

1. the original project CD or a complete copy of its `Spillet` directory;
2. old working directories or backups from the composers;
3. exported audio/MIDI files retained by a group member;
4. a Director projector or cast set different from the four supplied files.

If any such archive is found, preserve it unchanged before conversion. The
preferred restoration workflow is to extract the original file first, archive
its checksum and provenance, and only then make a Suno-enhanced derivative.
The original and enhanced tracks should receive separate stable IDs.

## Current conclusion

The browser game has audio only in the recreated intro unless a played video
contains its own dialogue/location soundtrack. Location music is not currently
implemented because the corresponding source tracks have not been recovered,
not because known music assets were left unconnected.
