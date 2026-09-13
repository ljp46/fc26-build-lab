# FC26 Build Lab

A chat-led EA SPORTS FC 26 Clubs build editor for **11v11, no Any, PC and Xbox Series**. Separate project from any existing dashboard.

## Current status

Early-access implementation. The manual editor and deterministic engine work locally. The Cloudflare/Gemini backend is implemented and tested with mocked provider responses; **live AI, live research and backend deployment still require the owner's account setup and end-to-end verification**. Do not interpret this release as independently verified game simulation or a completed hidden-mechanics database.

Features: 11 outfield archetypes, 29 attributes, cumulative AP costs over 100 levels, star upgrades, regular and signature PlayStyles, specialization requirements, 33 club facilities, planned versus active facilities, body effects, 23 linked running-animation previews, undo, browser save/load, JSON import/export, locked choices, AI proposals and requested edits. Invalid manual drafts are visibly flagged and cannot be submitted to AI. Switching archetype resets player choices; club facilities remain.

Chat can answer, suggest, or return a complete build. Its numerical proposals are calculated and validated by the same engine used in the editor. Responses cannot change player level, club level, locks, or active facilities. Applying a stale proposal after a manual edit is rejected. Optional online research uses a separate grounded Gemini call; research cannot silently rewrite calculation rules.

## Run locally

Requires Node.js 22.12+ (Node 24 also supported). The website has no npm dependencies.

```sh
npm start
npm test
npm run build
```

Open http://127.0.0.1:4173. `dist/` contains only the public site. On a Windows sandbox that prohibits child processes, tests can run with `node --test --test-isolation=none tests/engine.test.mjs tests/worker.test.mjs` on Node 24.

## Publish the website

In GitHub repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**. The included workflow tests, builds and publishes pushes to `main`; PRs only run tests/build. The expected URL after successful deployment is `https://ljp46.github.io/fc26-build-lab/`.

## Enable chat (owner setup)

1. Create/sign into a Google AI Studio account and obtain a Gemini API key. Check that the selected model is available on your project's free tier. Do not enable paid billing if zero spend is required. Free availability and quotas can change; no unlimited-use promise is made.
2. Create/sign into a Cloudflare account with Workers Free.
3. Deploy this repository's `worker/index.js` with the included `wrangler.jsonc`, using an official current Wrangler release (`npx wrangler deploy`). Alternatively use Cloudflare Workers Builds connected to this repository with deploy command `npx wrangler deploy`.
4. Add **encrypted Worker secrets** named `GEMINI_API_KEY` and `TEAM_CODE` via the Cloudflare dashboard or `npx wrangler secret put NAME`. Enter values interactively. Never put either secret in the repository, frontend, URL, chat transcript or screenshots.
5. Check `GEMINI_MODEL` is supported in your AI Studio project. The initial value is `gemini-2.5-flash`. `ALLOWED_ORIGINS` is `https://ljp46.github.io`; for local testing explicitly add `http://127.0.0.1:4173`.
6. In the website's **Connect chat** dialog enter the Worker URL and team access code. The code remains in memory for that tab; the URL is stored in browser local storage.
7. Verify a real answer, a complete generated build with PlayStyles/facilities, an explanation-only review, a locked-attribute rebalance, and an online research request before inviting friends.

The backend refuses requests without its secrets and rate limiter. Its team limiter is 5 requests/minute **per Cloudflare location**, not a global accounting limit. A request may make up to three provider calls (optional research + generation + one repair). Provider free-tier quotas remain the spending boundary. A team access code is a lightweight shared gate, not per-user authentication. The website itself is public.

Google receives messages, recent conversation context and build data. Free-tier data handling is governed by Google's current terms. Cloudflare handles the backend requests. Animation previews load from Vimeo only when clicked. Google Fonts supplies the fonts. No EA login or game account is used.

## Sources and verification boundaries

- [EAFC Clubs machine-readable reference](https://eafcclubs.com/data/eafc26-pro-clubs-data.json): archetypes, ranges, descriptions and unlock requirements; generated 17 July 2026.
- [EAFC Clubs calculator v1.7.1](https://eafcclubs.com/): numerical AP tiers, progression, body modifier table, star costs and facility data observed 13 September 2026. Numerical data is attributed; application source/design are independently implemented. The original app's code and artwork are not bundled.
- [Mufasa Gaming running styles](https://www.mufasagaming.com/running-styles): 23 named clips, embedded from their original Vimeo URLs with original-source links. No videos are downloaded or rehosted. Embedding depends on the publisher's settings.
- [EA Clubs deep dive](https://www.ea.com/games/ea-sports-fc/fc-26/news/pitch-notes-fc26-clubs-deep-dive): progression concepts and separation of body effects from bought attributes.
- [EA gameplay deep dive](https://forums.ea.com/blog/ea-sports-fc-game-info-hub-en/ea-sports-fc-26--pitch-notes---gameplay-deep-dive/12371925): standing-tackle animation thresholds.
- A community reactions discussion is recorded as **unverified**, not a numeric formula. See `data/evidence.json`.

Known discrepancy: the published JSON lists regular slot 3 at level 20; the current calculator uses 30. This app uses 30. Source attribute spelling variants are normalized. Target Strength has the source calculator's special tier override. Builds are community-reference-valid, not EA-certified. There are no goalkeeper archetypes. Real-player animation mappings, exact hidden formulas, and current-patch optimality are not established. A breakpoint is not proof that higher stats have no benefit. Human control can reduce the relevance of positioning while it remains an unlock requirement.

Female AcceleRATE uses the source's alternate height condition but body modifier tables are shared by the source; independently validating female-specific modifiers remains outstanding. Facility-granted PlayStyles are shown separately. More detailed signature-slot swapping behaviour and duplicate interactions with facility PlayStyles need in-game verification.

## Data maintenance

`data/game.json` is a versioned snapshot, not a live API dependency. Preserve source provenance and compare future changes before replacing it. Every new mechanics claim needs a source, game/patch, mode, platform and confidence label. Online research is transient context only. Prefer original controlled tests and EA notes; do not turn repeated anecdotes into confirmed rules.

## Validation

Automated tests cover all archetypes' base builds, AP checkpoints observed in the source UI, the Target cost exception, star costs, slot discrepancy, facility budget and boost separation, optimizer budgets/locks, backend authentication/rate-limit errors, mocked AI generation and rejected changes. Browser checks cover desktop layout, manual edits and facilities. Live provider/Cloudflare tests require credentials.

EA SPORTS FC is a trademark of Electronic Arts. This independent tool is not affiliated with EA or Mufasa Gaming. Referenced game data/media remain the property of their respective owners.
