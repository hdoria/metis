# Métis landing on Vercel

The landing lives in `site/landing`. Use the repository root as the Vercel Root Directory so the workspace lockfile and the root LICENSE remain available. `vercel.json` builds only the landing and publishes `site/landing/dist`.

Official domain: `metisapp.com.br`. The `www` hostname redirects permanently to the apex, preserving the request path. Both hostnames are attached to the same Vercel project.

Team: `popcode`. Project: `metis-landing` (`prj_o7aaBYhx7xyuMcDYhEMekx1QcK8U`). Production fallback: https://metis-landing-roan.vercel.app. Dashboard: https://vercel.com/popcode/metis-landing.

## Deployment

Use the existing Vercel project. `.vercel/` contains machine-local configuration and must remain untracked. Do not copy authentication tokens into the repository. Deployment currently uses the CLI: connecting `hdoria/metis` to Vercel's GitHub integration was rejected, so a Git push alone does not publish the landing.

```sh
npx vercel@65.15.0 link --yes --scope popcode --project metis-landing
npx vercel@65.15.0 build --prod --yes --scope popcode
npx vercel@65.15.0 deploy --prebuilt --prod --archive=tgz --scope popcode
```

The build must include `index.html`, `creditos.html`, `LICENSE.txt`, fonts and application assets. Verify the published URLs after deployment.

## Domain

The authoritative delegation now points to Cloudflare (`arch.ns.cloudflare.com` and `lana.ns.cloudflare.com`), confirmed against the .br parent zone. Keep those nameservers and manage web records in Cloudflare. On 2026-11-12, Vercel reported `configured-correctly` and verified ownership for both hostnames after the DNS records were applied.

On 2026-11-12, Vercel recommended these Cloudflare records:

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | @ | 4c4f40b241a88a3c.vercel-dns-016.com | DNS only |
| CNAME | www | 4c4f40b241a88a3c.vercel-dns-016.com | DNS only |

Use automatic TTL. Cloudflare flattens the apex CNAME. Replace only conflicting web records for these names and preserve mail records. Obtain fresh recommendations before future DNS changes:

```sh
npx vercel@65.15.0 domains verify metisapp.com.br --project metis-landing --scope popcode --json
npx vercel@65.15.0 domains verify www.metisapp.com.br --project metis-landing --scope popcode --json
```

See the [project domain settings](https://vercel.com/popcode/metis-landing/settings/domains) and [Vercel domain setup guide](https://vercel.com/docs/domains/set-up-custom-domain). After future DNS changes, verify both hostnames, HTTPS and the www redirect. Domain ownership alone does not establish working DNS or TLS.

HTTPS was validated on both hostnames after issuing the managed certificate through Vercel. The landing, credits and license returned 200 with certificate validation enabled. The www redirect returned 308 and preserved the path and query string. Tests used public DNS results with curl's `--resolve` because the local system resolver still did not resolve the hostnames; propagation to every resolver is not claimed.

The previous Sites publication remains a historical private preview. Its pending custom-domain binding was removed and its identity manifest archived as `docs/hosting/sites-preview.json`; it is not the active deployment configuration. Migration of the landing does not publish or distribute application binaries.
