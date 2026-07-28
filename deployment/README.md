# Cloudflare Pages deployment

Saving Ryan is a static Vite application. Production is served by Cloudflare
Pages and has no runtime process, port, database, API, secret, or dependency on
the Mac Mini.

## Fixed production contract

- Pages project: `saving-ryan`
- Production branch label: `main`
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Custom domain: `ryan.petergpt.dk`
- Exposure: public custom domain
- Test-hostname exposure: Cloudflare Access on `saving-ryan.pages.dev` and
  `*.saving-ryan.pages.dev`
- Liveness: `/health/live`
- Readiness: `/health/ready`

The deployment uses Pages Direct Upload. No `wrangler.toml` is needed because
the app has no Pages Functions, bindings, environment variables, or Worker
runtime configuration.

The operator's `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are supplied
outside the repository. Never place their values in this repository.

## Build and upload

```sh
nvm use
npm ci
npm test
npm run build
wrangler pages deploy dist \
  --project-name saving-ryan \
  --branch main \
  --commit-hash "$(git rev-parse HEAD)" \
  --commit-dirty=false
```

The first deployment must be followed by Pages custom-domain association.
Keep the custom domain public. Protect `saving-ryan.pages.dev` and wildcard
preview deployments with their separate self-hosted Access applications.

Resolve exact existing targets before every write; never overwrite an existing
Pages project, Access app, or DNS record.

See [`docs/OPERATIONS.md`](../docs/OPERATIONS.md) for verification and rollback.
