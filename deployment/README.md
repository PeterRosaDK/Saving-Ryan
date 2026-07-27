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
- Exposure: `cloudflare-access`
- Access allow-list: `peterrosadk@gmail.com`
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
Cloudflare currently cannot validate a new Pages custom domain while Access is
already active on that hostname, so add Access only after the custom domain and
certificate are active. Then protect `ryan.petergpt.dk` with a self-hosted
Access application and enable the Pages access policies for both
`saving-ryan.pages.dev` and its preview deployments.

Resolve exact existing targets before every write; never overwrite an existing
Pages project, Access app, or DNS record.

See [`docs/OPERATIONS.md`](../docs/OPERATIONS.md) for verification and rollback.
