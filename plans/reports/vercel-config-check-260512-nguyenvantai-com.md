# Vercel Config Check - nguyenvantai.com

**Date:** 2026-05-12  
**Account:** `nguyentai02072k5-5965`  
**Project:** `nguyentai`

## Config Applied

- Framework set to `nextjs`
- Install command set to `pnpm install`
- Build command set to `pnpm build`
- Env var set: `NEXT_PUBLIC_SITE_URL=https://nguyenvantai.com`
- Apex domain `nguyenvantai.com` set as primary, no redirect
- `www.nguyenvantai.com` redirects to `nguyenvantai.com` with `308`

## Verified State

| Item | State |
|---|---|
| `nguyenvantai.com` | verified |
| `www.nguyenvantai.com` | verified |
| apex redirect | none |
| `www` redirect | `nguyenvantai.com` |
| env keys | `NEXT_PUBLIC_SITE_URL` |
| deployments | `0` |
| Git repository link | not connected on this Vercel project |
| GitHub public repos for account | none returned by public API |
| local `gh` auth | invalid token, cannot inspect private repos |
| live HTTP | `404 Not Found` |

## Interpretation

Domain/DNS is attached and verified, but no production deployment exists yet. The current Vercel project also does not expose a linked Git repository through the Vercel API.

Before production launch, link/import the exact GitHub repository into this Vercel project or deploy via Vercel CLI/API. After first deployment, `https://nguyenvantai.com` should stop returning 404.

## Unresolved Questions

- Exact GitHub repo full name to link/deploy from.
