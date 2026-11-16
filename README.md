# markdown-render-speed

[![make.fun · markdown-render-speed-02](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/nerdwallet6/markdown-render-speed/rank.svg)](https://make.fun/bounty/markdown-render-speed-02/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/nerdwallet6/markdown-render-speed/reward.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)

Built for the [make.fun bounty markdown-render-speed-02](https://make.fun/bounty/markdown-render-speed-02).

A fast, dependency-free drop-in for marked 18.1.3 (GFM on, default options).
`parse(markdown)` returns exactly the HTML `marked.parse` returns, for every
input — implemented from scratch against the CommonMark 0.31.2 and GFM 0.29
specifications, with no third-party code.

## Files

- `parse.js` — the parser (ES module, exports `parse`)
- `main.ts` — the harness driver: reads `/input/cases.json`, writes
  `/output/html.json`

## Run

```sh
node main.ts
```

`MAKEFUN_INPUT_DIR` / `MAKEFUN_OUTPUT_DIR` override `/input` / `/output`.
