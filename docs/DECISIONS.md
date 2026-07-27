# Production decisions

## 2026-07-28 — Cloudflare Pages Direct Upload

Saving Ryan is deployed as `cloud-hosted-static` from the reproducible `dist/`
directory. Pages Direct Upload is preferred over a Git-connected build for the
first release so production can be tied to the exact locally tested commit.

No Wrangler configuration file is added: the app has no Functions, bindings,
routes, compatibility flags, or environment variables. Adding empty runtime
configuration would create a false dependency.

Rollback is a Cloudflare Pages deployment rollback or a redeploy of the
previous known-good Git commit. The Mac Mini is not an origin and its uptime
does not affect the game.

## 2026-07-28 — Private preview access

The first hosted release uses Cloudflare Access for
`peterrosadk@gmail.com`. Both the custom domain and the default
`saving-ryan.pages.dev` hostname must be covered so the latter cannot bypass
the gate.

Reason: a browser game necessarily downloads its JavaScript and media. Security
headers and repository privacy cannot prevent an authorized visitor from
saving those assets, and the legacy videos contain identifiable participants.
Access limits initial distribution while ownership, consent, and the desired
public-release policy are reviewed.

Changing the exposure to `public` is a later explicit product decision. It
requires removing or changing the Access application, updating
`X-Robots-Tag`/`robots.txt`, and reviewing media rights. It does not require a
new game architecture.

## 2026-07-28 — Static health endpoints

`/health/live`, `/health/ready`, and `/health` proxy to bounded JSON assets.
For a static application, deployment availability is both liveness and
readiness; there are no dynamic dependencies to probe.
