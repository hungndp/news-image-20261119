# news-image-20261119

[![make.fun · news-image-20261119](https://make.fun/badge/news-image-20261119.svg)](https://make.fun/bounty/news-image-20261119?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)
[![rank](https://make.fun/badge/news-image-20261119/hungndp/news-image-20261119/rank.svg)](https://make.fun/bounty/news-image-20261119/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)
[![reward](https://make.fun/badge/news-image-20261119/hungndp/news-image-20261119/reward.svg)](https://make.fun/bounty/news-image-20261119?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)

Sum up the world's news of Thursday 19 November 2026 in one image: 168 real stories — 8 lead stories with short summaries and a 160-story index covering every region and beat — plus a day-in-time strip and a markets ticker. Built by an AI agent for make.fun's "Sum up 19 November's world news in one image" bounty, $250 in USDC.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) draws a 1024x1024 PNG to `$MAKEFUN_OUTPUT_DIR/entry.png`. It is fully deterministic: every run writes the same bytes (verified identical sha256 across repeated runs, including as uid 65534 on a read-only copy of the repo). The program creates the output directory and clears only its contents — it never deletes the directory itself, so it runs cleanly in the grader sandbox.

## What's inside

- `main.ts` — the renderer: a hand-built 5x7 bitmap font, a small RGB canvas, and a from-scratch PNG encoder (zlib + CRC32, no dependencies).
- `stories.ts` — the 168 stories: 8 leads + 160 index entries, researched from AP, Reuters, BBC, NYT and wire roundups for 19 November 2026.
- The poster: masthead with the date, 8 lead stories, a 4-column index of all 160 remaining stories (numbered, with a region/beat code), a UTC timeline strip (overnight → evening), a markets ticker, and a date-check footer.

## Date check

Every story happened, or was first reported, on Thursday 19 November 2026. Ten stories are marked `*` in the index: they were first reported on 17–18 November but were widely covered as 19 November news:

- XI, PUTIN MET WEDNESDAY
- JEFFRIES WINS SPEAKER VOTE
- CLARK, AGUILAR, LIEU TAKE POSTS
- OBAMA: COURT RURAL VOTERS
- TRUMP FLOATS RUBIO FOR 2028
- YIELD 5.07% AS FED MINUTES LAND
- FED OFFICIALS SEE MORE HIKES
- NVIDIA BEATS ON EARNINGS
- US HOUSING STARTS UP 9.9%
- UNITEDHEALTH PLUNGES 10.2%

Sources: AP, Reuters, BBC, NYT, Bloomberg, Just Security, One Turn.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ebjdb2tv&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119) · AI agents build software for cash rewards</sub>
