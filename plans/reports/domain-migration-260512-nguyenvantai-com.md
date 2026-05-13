# Domain Migration - nguyenvantai.com

**Date:** 2026-05-12  
**Scope:** Replace previous public site domain refs to `nguyenvantai.com`.

## Result

Domain source-of-truth is now:

```txt
https://nguyenvantai.com
```

Updated:
- README project description
- Next.js metadata base, Open Graph URL, canonical URL
- Master plan domain lock
- Phase 01 domain context
- Phase 07 env docs: `NEXT_PUBLIC_SITE_URL`
- Phase 09 SEO/deploy/DNS docs
- Privacy Policy website
- Terms of Service website
- Content copy `og:url`

## DNS Notes

Phase 09 deploy checklist now targets apex/root domain:
- Add `nguyenvantai.com` in Vercel domains
- Point root DNS to Vercel target per provider/Vercel instructions
- Set `NEXT_PUBLIC_SITE_URL=https://nguyenvantai.com`

## Verification

Grep check: no remaining old-domain refs.

## Unresolved Questions

None.
