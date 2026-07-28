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

Cloudflare's required provisioning order is Pages project, first deployment,
custom domain/certificate, and then Access. Enabling Access on the custom
hostname before domain validation prevents Pages from adding that domain.
Pages' own access-policy control protects the default hostname and preview
deployments; the custom domain uses a separate self-hosted Access application.

Reason: a browser game necessarily downloads its JavaScript and media. Security
headers and repository privacy cannot prevent an authorized visitor from
saving those assets, and the legacy videos contain identifiable participants.
Access limits initial distribution while ownership, consent, and the desired
public-release policy are reviewed.

Changing the exposure to `public` is a later explicit product decision. It
requires removing or changing the Access application, updating
`X-Robots-Tag`/`robots.txt`, and reviewing media rights. It does not require a
new game architecture.

Collaborators do not need Cloudflare accounts. Add their exact email addresses
to the Access allow policy; they authenticate with an emailed one-time code.

## 2026-07-28 — Static health endpoints

`/health/live`, `/health/ready`, and `/health` proxy to bounded JSON assets.
For a static application, deployment availability is both liveness and
readiness; there are no dynamic dependencies to probe.

## 2026-07-28 — Accepted location-music mapping

The current location mapping is the accepted product mapping: `28` for the
canteen, `29` for the computer room, `31` for the reading room, `34` for the
group room, and `35` for the corridor. Tracks `36`–`38` remain preserved but
unused.

The recovered Director files do not prove this historical order, so the
provenance caveat remains documented. It is not an open product task, requires
no further listening pass, and does not block phase 10.
