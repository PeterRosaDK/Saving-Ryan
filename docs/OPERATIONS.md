# Operations

## Local development

```sh
nvm use
npm ci
npm run dev
```

The development server is manual only. It is not a production service.

## Validation

```sh
npm test
npm run typecheck
npm run build
npx wrangler pages dev dist
```

Verify `/`, `/health/live`, `/health/ready`, `/site.webmanifest`,
`/favicon.svg`, representative JavaScript/CSS, one image, one video, and one
audio file. A nonexistent path must return the committed 404 response.

## Production

- URL: `https://ryan.petergpt.dk`
- Pages fallback: `https://saving-ryan.pages.dev`
- Pages project: `saving-ryan`
- Repository: `https://github.com/PeterRosaDK/Saving-Ryan`
- Build output: `dist`
- Runtime data/logs: none
- External service: Cloudflare Pages and Access
- Possible cost: subject to the owner's Cloudflare plan and usage
- Privacy: no analytics or application-side user data collection

Cloudflare credentials are operator secrets outside Git. The app itself has no
environment variables.

For a new project, associate and validate the Pages custom domain before
creating its Access application. Afterwards, enable Access separately for the
custom hostname, the production `pages.dev` hostname, and preview deployments.

## Recovery and rollback

Source and historical assets are recovered from the private GitHub repository.
Dependencies are restored with `npm ci`; the build is restored with
`npm run build`. `dist/` is not backed up because it is reproducible.

To roll back production, select the last known-good Pages deployment in
Cloudflare and use **Rollback**, or check out that Git commit, rebuild, and
upload the resulting `dist/`. Do not delete the current deployment, Pages
project, custom domain, DNS record, or Access application during rollback.

The local ignored `Legacy Fresh/` forensic folder is not reproducible from this
repository and remains the owner's separately preserved source material.
