# Free public portfolio deployment

The public-only package is produced by `node scripts/prepare-public-site.mjs` into `.public-site/`. No dependencies or Docker installation are needed. The packager refuses an existing output directory to avoid accidentally publishing stale files.

The package includes the public home, resume, projects, case studies, blog and error pages, plus CSS, JavaScript, YAML content and public documents. It uses `deploy/public.staticwebapp.config.json` as its root `staticwebapp.config.json`. The original configuration and all admin/API source remain in Git, unchanged; they are not published. Admin/API paths and both built-in provider login routes return 404. Azure's platform `/.auth/me` endpoint still returns an anonymous null principal; it is not a deployed backend. Provider login requires exact deny routes, not merely `/.auth*`. Draft/test pages and development documentation are not included.

The replacement must use Azure Static Web Apps **Free**. Do not enable custom identity providers, paid edge features, App Service plans, separate Functions, storage, or databases. Website edits are made in GitHub, not via the excluded admin prototype.

The prepared GitHub workflow publishes only `.public-site`, uses no API location and disables Oryx compilation. PRs validate packaging without deployment secrets; only main-branch pushes or main-branch manual runs can deploy. Actions are pinned to verified commit IDs. Deployment setup is still pending: after creating the replacement Free app, store its token as `AZURE_STATIC_WEB_APPS_API_TOKEN_PERSONALWEBSITES`, enable Actions if necessary, and obtain explicit approval to merge the workflow PR. Never reuse the old app's token, publish credentials, or target the upstream fork parent. The repository is `krnch/piuwebsitechaudharisp`, branch `main`.

## GoDaddy stays the DNS provider

Keep both old Azure resources intact until the replacement is verified. Distinct Azure default hostnames do not clash. The same custom hostname cannot simply be attached to both apps: resolve the existing Azure `www.priyankaco.com` association before cutover; a disabled source subscription may require Azure support or reactivation to release it.

After the new Azure URL serves the correct pages and its custom-domain setup is ready:

1. GoDaddy → My Products → priyankaco.com → DNS.
2. Edit the existing CNAME named `www`, replacing `lemon-coast-0d8cb9510.7.azurestaticapps.net` with the new Azure hostname (no scheme or slash). Do not add a duplicate record.
3. Add only the exact domain-validation TXT record Azure requests, if required.
4. Forward `priyankaco.com` to `https://www.priyankaco.com`, permanent 301, forwarding only, not masking. Do not create an apex CNAME.
5. Keep nameservers, MX and mail-related TXT records unchanged. Verify HTTPS on both addresses and the expected page content before declaring cutover complete.

Replacement Azure URL: **https://calm-smoke-042f5fa10.2.azurestaticapps.net**. It is deployed on Free in `personalwebsites`, resource `swa-personalwebsites-prod-piu-c561`, resource group `rg-personalwebsites-prod-c561`, Central US. All 49 public files passed live byte-for-byte checks; 72 total content/redirect/security checks passed. Existing missing source content remains a separate caveat below.

The eventual GoDaddy `www` CNAME target is **calm-smoke-042f5fa10.2.azurestaticapps.net**, but **do not change it yet**: the old Azure claim must be released and the new custom-domain binding validated first. No claim release, custom-domain attachment, TXT validation, DNS change or old-app deletion has been performed. Azure Free hosting and GoDaddy domain renewal are separate.

Known source-content caveats: some blog links reference absent articles, and the Figma article references missing `js/main.js`. Existing ComplianceAI routes redirect to a separate app; that app is not copied by this deployment.