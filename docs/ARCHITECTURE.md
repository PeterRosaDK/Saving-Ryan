# Production architecture

Saving Ryan is one static, client-side Vite/TypeScript application.

```text
private GitHub repository
          |
          | local, reproducible npm build
          v
       dist/
          |
          | Wrangler Direct Upload
          v
  Cloudflare Pages
          |
          v
  public ryan.petergpt.dk
```

`src/`, `index.html`, and `public/` are authoritative. `dist/` is generated and
ignored. The original Director projects and report in `Legacy/` are historical
source material; `Legacy Fresh/` is a larger local forensic working copy and is
intentionally ignored.

The browser owns all game state. There is no backend, database, account system,
analytics, external API, environment variable, or runtime secret. Pages serves
the compiled module, CSS, images, video, and audio. The custom production
domain is public; Cloudflare Access remains only on `saving-ryan.pages.dev`
and version-specific preview hostnames.

The phase 10 case boundary lives in `src/game/caseDefinitions.ts`.
`selectedCaseId` is top-level version 3 game state: the main menu selects it
once for a new game, and ordinary day-loop resets leave it unchanged.
The enabled Director’s Cut pool contains David and Barbara. Unfinished future
cases are not registered, so selection can never enter a partial story.

Arbitrary paths must return the committed `404.html`; the application does not
use client-side routing. Static JSON liveness and readiness responses are valid
because the deployed site's core dependencies are exactly its uploaded assets.
