# media-src

Raw, unoptimised media goes here, one folder per project slug (git-ignored):

```
media-src/northwind-coffee/cover.mov
media-src/northwind-coffee/gallery-1.jpg
```

Then run `npm run media -- northwind-coffee`. Optimised files land in `public/media/projects/northwind-coffee/`.
See AGENTS.md for the full workflow.
