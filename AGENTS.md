# Sitekeep website: guide for coding agents

This is the Sitekeep agency site: a Vite + vanilla JS single-page site animated with GSAP and smooth-scrolled with Lenis.
**Most changes are content changes. Content lives in two data files; you rarely need to touch the modules.**

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run media -- <project-slug>   # optimise raw media for one project (needs ffmpeg + cwebp)
```

---

## 1. Where things live

| What | File |
| --- | --- |
| Projects (showcase cards + expanded detail pages) | `src/data/projects.js` |
| All other copy: preloader words, headline, testimonials, approach, team, contact form questions, footer links, email, form endpoint | `src/data/site.js` |
| Optimised media served by the site | `public/media/projects/<slug>/`, `public/media/team/`, `public/media/site/` |
| Raw media dropped in by the owner (git-ignored) | `media-src/<slug>/` |
| Media optimiser | `scripts/optimize-media.sh` |
| Styles (one file, sectioned with comments) | `src/styles/main.css` |
| Behaviour | `src/modules/*.js`: `preloader`, `showcase` (card stack hero), `detail` (expand view), `sections`, `contact`, `header`, `media`, `theme` |

Brand colour: `--brand: #f26a1b` (Sitekeep orange) in `main.css`, and `BRAND` in `src/modules/theme.js`. If you change it, change both, plus `logo-mark__merlon--accent` and `public/favicon.svg`.

---

## 2. When the owner drops in real videos and images

The owner will put raw files (phone exports, ProRes `.mov`, huge PNGs…) into the repo. **Never reference raw files from the site.** Always optimise first.

### Step-by-step

1. **Work out which project each file belongs to** (ask if unclear) and its `slug` from `src/data/projects.js`.
2. **Move the raw files to `media-src/<slug>/` and rename them by role:**
   - `cover.<ext>`: the main media shown on the showcase card *and* as the detail-page hero. Video or image.
   - `gallery-1.<ext>`, `gallery-2.<ext>`, …: extra media shown in the detail page gallery, in that order.
   Raw files in `media-src/` are git-ignored on purpose; don't commit them.
3. **Run the optimiser:** `npm run media -- <slug>`. You need `ffmpeg` and `cwebp` (`brew install ffmpeg webp`).
   It writes to `public/media/projects/<slug>/`:
   - videos → `<name>.mp4` (H.264, ≤1600px wide, ≤30fps, **audio removed**, `+faststart`), `<name>.webm` (VP9), `<name>-poster.webp` (first frame)
   - images → `<name>-800.webp`, `<name>-1600.webp`, `<name>-2400.webp` (only sizes the source is wide enough for)
4. **Check the sizes it prints.** Targets:
   | Asset | Target | If too big |
   | --- | --- | --- |
   | cover video (mp4) | **≤ 3 MB**, ideally 1–2 MB | trim to 6–12 s (see below), or raise `MP4_CRF` to 28 |
   | gallery video | ≤ 5 MB | same |
   | poster | ≤ 120 KB | fine as is |
   | image @1600 | ≤ 250 KB | lower `WEBP_Q` to 72 |
   If the `.webm` comes out **bigger** than the `.mp4` (it can, with noisy footage), don't reference it: leave out the `webm` field.
5. **Update `src/data/projects.js`** (replace the placeholder URLs):

   ```js
   // video cover
   cover: {
     type: 'video',
     src: '/media/projects/northwind-coffee/cover.mp4',
     webm: '/media/projects/northwind-coffee/cover.webm',        // optional, served first
     poster: '/media/projects/northwind-coffee/cover-poster.webp', // always include for videos
   },

   // image cover
   cover: {
     type: 'image',
     src: '/media/projects/northwind-coffee/cover-1600.webp',
     srcset: '/media/projects/northwind-coffee/cover-800.webp 800w, /media/projects/northwind-coffee/cover-1600.webp 1600w, /media/projects/northwind-coffee/cover-2400.webp 2400w',
     alt: 'Northwind Coffee product page on a phone',   // describe what's in it
   },

   gallery: [
     { type: 'image', src: '/media/projects/northwind-coffee/gallery-1-1600.webp', srcset: '… 800w, … 1600w, … 2400w', alt: '…' },
     { type: 'video', src: '/media/projects/northwind-coffee/gallery-2.mp4', poster: '/media/projects/northwind-coffee/gallery-2-poster.webp' },
     { type: 'youtube', id: 'dQw4w9WgXcQ' },   // a YouTube embed, fine in galleries
   ],
   ```
   Only include `srcset` entries for files that actually exist.
6. Run `npm run dev` and check: the card plays, the detail hero plays, nothing 404s (browser console / network tab).

### Useful manual ffmpeg commands

```bash
# Trim to a 10 s loop starting at 0:04 before optimising (re-encode for an exact cut)
ffmpeg -ss 4 -i media-src/<slug>/raw.mov -t 10 -c:v libx264 -crf 16 -an media-src/<slug>/cover.mov

# Crop a vertical phone recording onto a 3:2 frame with a blurred backdrop (cards are 3:2)
ffmpeg -i in.mov -filter_complex "[0]scale=1600:-2,boxblur=30,crop=1600:1066[bg];[0]scale=-2:1066[fg];[bg][fg]overlay=(W-w)/2:0" -an out.mov
```

### Media rules

- **Aspect ratio:** cards and the detail hero are **3:2** (e.g. 1600×1066). Other ratios are cropped to fill (`object-fit: cover`), so keep the subject centred. Gallery: first item 16:9, others 4:3.
- **Cover videos autoplay muted on loop.** Audio is always stripped. Keep them 6–15 s, with no important text near the edges.
- **Only the active card loads its video** (plus the next one in advance). Videos use `preload="none"` until needed, so many projects don't slow the first load. Keep it that way: don't add `autoplay` or `preload="auto"` in markup.
- **Posters matter:** they're what shows during the preloader and while scrolling fast. Always set `poster` for videos.
- **Don't use YouTube for covers.** It's heavy, can't loop seamlessly and shows UI. It's fine in `gallery`.
- Team photos: square, ≥ 600px, put them in `public/media/team/`, run them through `cwebp -q 80 -resize 600 0`, then update `site.team.people[].photo`. They're shown greyscale automatically.
- Testimonial avatars / tiles and the approach thumbnail live in `site.js`; same treatment (`public/media/site/`).

---

## 3. Adding or editing a project

Projects appear in the showcase **in array order**. The first one is what visitors see after the preloader, so make it the strongest.
Add an object to `projects` in `src/data/projects.js`:

| Field | Required | Notes |
| --- | --- | --- |
| `slug` | ✔ | unique, kebab-case. URL becomes `/work/<slug>`. Also the media folder name. |
| `title` | ✔ | one short sentence. Shown under the card and as the detail heading. Keep ≤ 55 chars so it fits on one line. |
| `kicker` | ✔ | category label coloured with the accent (e.g. `E-commerce`, `Update`) |
| `client` | ✔ | client name; its first letter becomes the badge in the detail view |
| `date` | ✔ | display string, e.g. `September 2026` |
| `industry` | ✔ | plural noun that slots into the headline "Sitekeep designs, builds and keeps **{industry}** that work, by design." e.g. `storefronts`, `law firms` |
| `accent` | ✔ | hex colour for this project. Drives the shuffle button, progress rail, caption kicker, headline word, page tint and the full-bleed "Outcomes" section in the detail view. Pick a colour from the project's own brand. Text on the outcomes section switches to dark automatically for light accents. |
| `tint` | | 0–10. How strongly the page background tints towards `accent` while this card is active (percent). 6–8 is subtle; 0 disables. |
| `cover` | ✔ | media object (see §2) |
| `year`, `services[]`, `team[]` | ✔ | detail-page meta list |
| `summary` | ✔ | one-paragraph intro, shown larger |
| `body[]` | ✔ | paragraphs |
| `stats[]` | | `{ value, label }`. Three works best. Omit to hide the outcomes section. |
| `gallery[]` | | media objects. Omit to hide the gallery. |
| `more[]` | | `{ label, title, body }`, 2–4 of them. The "More from this project" card stack near the end of the detail page; `label` is the short folder tab (e.g. `Strategy`, `Design`, `Build`), `title` ≤ 45 chars, `body` 1–2 sentences. Omit to hide the section. |

Removing a project = delete its object (and its `public/media/projects/<slug>/` folder). Reordering = reorder the array. The progress rail and "next project" links adapt automatically.

---

## 4. How the signature interactions work (so you don't break them)

- **Preloader** (`modules/preloader.js`): the logo base draws in as a line, the three merlons pop up, then the headline words (`site.preloader`) rise in. It waits for fonts + the first card's media (max ~3 s), then blurs the headline away and calls `showcase.intro()`, which flies the cards up into the stack, back ones first. Deep links (`/work/<slug>`) skip it.
- **Showcase** (`modules/showcase.js`): a single-screen hero (on phones it is only as tall as its content, so the statement follows on the first screen). The stack is **cyclic**: `stateFor(d)` gives a card `d` places behind the active one a smaller scale and a small drop, so the next two peek out underneath. Going forward throws the front card off the top (`FLOWN`) and it rejoins the back; going back drops it in from above. The intro flies the cards up from below, back ones first.
  - **Input:** wheel/trackpad *over the stack* (`[data-stage]`, marked `data-lenis-prevent-wheel`) switches cards and does not scroll the page; anywhere else the page scrolls normally. The wheel handler ignores the trackpad's inertia tail so one flick = one card. On touch, a sideways swipe switches cards and vertical swipes scroll the page. Left/right arrow keys also work.
  - **Autoplay:** the active rail dot stretches into a pill whose fill (`.rail__fill`) runs for the card's duration (the cover video's length clamped to 5–12 s, else 7 s), then advances. It pauses while the stack is off screen, the tab is hidden or a project is open. Tune with the `AUTOPLAY_*` constants.
  - Changing the active card also calls `setTheme()`, which updates the registered CSS custom properties `--accent` / `--tint`; CSS transitions them smoothly (`@property` in `main.css`).
  - Sizes: `--stack-w` (card) and `--hero-w` (expanded hero) in `:root`. Both are 3:2.
- **Statement** (`initStatement` in `modules/sections.js`): the industry word is set in mono and swaps letter by letter. Every other word is its own inline-block; when the word changes, its slot snaps to the new width and the other words FLIP from where they were, so changed line breaks glide instead of jumping. Keep `site.statement.before/after` as plain text (no markup).
- **Expand** (`modules/detail.js`): clicking the active card *moves* that card's media element into the detail hero, so the video keeps playing. It then FLIPs the hero from the card rect to its final rect, fading the overlay to near-black. The card and the hero must keep the **same aspect ratio (3:2)** or the FLIP distorts. Inside the detail, each `<section data-bg="dark|accent|light">` sets the background; the colour is tied to the scroll position and cross-fades over `BLEND` of the viewport around each boundary. The detail view scrolls with its own Lenis instance (`inner`, created in `render()`, destroyed in `teardown()`); its sections live in `[data-content]` inside the scroller. The "More from this project" stack (`initMore()`) has an accent-coloured glowing `.orb` behind it; the approach accordion on the home page uses the same `.orb`. Close (button / Esc / browser back) reverses everything. URLs use `history.pushState`, so the host must rewrite `/work/*` to `index.html` (`vercel.json` and `public/_redirects` for Netlify are included).
- **Contact form** (`modules/contact.js`): questions come from `site.contact.steps` (types: `text`, `email`, `chips` with optional `multi`, `textarea` with optional `optional`). `{first}` in a question is replaced with the visitor's first name. The form is a fixed-size (292×330) frosted "sheet" on every screen size. The current question sits at the bottom; each answer glides up into a compact list under the avatar (`glide()`, a FLIP of the typed answer) and can be clicked to go back to that step (`goBack()`). From the second question the white screen lifts to reveal a Back bar (`.convo.has-bar`). There is deliberately no step counter. The card settles as you scroll in, the sheet drops in once with a swing (`initScrollMotion`), and it can be tugged by its handle (`initGrip`). On submit it POSTs JSON to `site.formEndpoint` if set (Formspree, Basin, a serverless function…); otherwise it opens a pre-filled email to `site.email`. **Set `formEndpoint` before launch.**
- **Footer + sky**: the contact section lives *inside* `<footer>`, so the frosted contact card floats on the same sky as the footer links. `<main>`'s background fades to transparent over its last 240px and the footer tucks under it (`margin-top: -240px`). The sky is a CSS gradient (white at the top, orange at the bottom) plus SVG turbulence clouds. To use a photo instead, put `public/media/site/footer-sky.webp` in and set it as the `background` of `.footer__sky` (delete the `<svg class="footer__clouds">`).
- **Reduced motion** is respected everywhere (`reducedMotion()`): no preloader, instant transitions.

---

## 5. Before shipping

- [ ] No `pexels.com`, `test-videos.co.uk`, `picsum.photos`, `randomuser.me` URLs left: `grep -rn "pexels\|test-videos\|picsum\|randomuser" src/`
- [ ] Every video has a `poster`; every image has meaningful `alt`
- [ ] `site.formEndpoint` set and tested; `site.email` correct
- [ ] Real social links in `site.footer` and `site.team.people[].link`
- [ ] `npm run build` passes; check `/work/<slug>` deep links on the deployed host
- [ ] Lighthouse mobile performance ≥ 90 (largest cost is usually the first cover video; keep it ≤ 2 MB)
