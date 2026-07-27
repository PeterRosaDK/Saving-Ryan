# Saving Ryan

Modern HTML5/TypeScript restoration of a Director 8 interactive mystery.

## Current status

The first conversion slice is underway:

- legacy Director files and the original report are preserved in `Legacy/`;
- converted MP4 files are served from `public/Video/`;
- 90 supplied BMP originals are preserved in `Legacy/Billeder/`;
- 93 web-ready PNG assets are served from `public/assets/images/`;
- the A1–E4 location/time model is implemented as a typed state machine;
- knowledge persists when evening wraps into another morning;
- transition narration recovered from `Spillet.dir` is wired into a runnable UI;
- all 20 original room photographs are rendered in the exploration stage;
- the Director-to-MP4 filename aliases are represented explicitly.

See [roadmap.md](roadmap.md) for the complete migration plan.
The image comparison and provenance notes are in
[docs/image-assets.md](docs/image-assets.md).

## Commands

```sh
npm install
npm run dev
npm test
npm run build
```

## Source layout

```text
Legacy/       original Director movies and project report
public/Video/ browser-ready MP4 files
public/assets/ web-ready image derivatives
src/app/      global state and store
src/game/     scene registry, transitions, and state machine
src/media/    media manifests and compatibility aliases
src/ui/       DOM rendering
tests/        state and manifest tests
```

The current interface renders the original room photographs. Director film-loop
placement, character animation, hotspots, and dialogue portraits are the next image
integration steps.
