# AGENTS.md

Instructions for any AI agent (Claude Code, Cursor, Copilot, etc.) working in this repo.

## Purpose

This blog is Tam's **learning notes and portfolio**, kept like a scientist's lab notebook:
honest records of what was tried, what worked, what didn't, and why.
Write and edit with that in mind: accuracy and clarity over polish.

See [`PLAN.md`](./PLAN.md) for goals and milestones, and [`TODO.md`](./TODO.md) for open work.

## Stack

- [Astro 5](https://astro.build) static site, content collections
- Tailwind CSS v4 (via `@tailwindcss/vite`) + `@tailwindcss/typography`
- MDX, Expressive Code (code blocks), KaTeX (`remark-math` + `rehype-katex`)
- Pagefind (search), `@astrojs/rss`, `@astrojs/sitemap`, Lucide icons, Chart.js
- Hosted on GitHub Pages at `https://aleadinglight.github.io/blog/` (`base: '/blog/'`)

## Commands

| Command | What it does |
| --- | --- |
| `npm ci` | Install dependencies from the lockfile |
| `npm run dev` | Local dev server |
| `npm run build` | Production build to `dist/` (also builds the Pagefind index) |
| `npm run preview` | Serve the built `dist/` |

Deploy: `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
**Merging to `main` publishes the site.**

## Layout

```
src/
  content/posts/     Blog posts (.md / .mdx)
  content/quotes/    quotes.json
  content.config.ts  Collection schemas (source of truth for frontmatter)
  components/        Astro components
  layouts/           Base.astro, BlogPost.astro
  pages/             Routes (index, posts/, search, rss.xml.js)
  styles/            global.css, fonts.css
  data/              Images and fonts imported by posts/components
  consts.ts          Site title, description, etc.
public/              Static files served as-is
```

## Post format

- File: `src/content/posts/<slug>.md` (or `.mdx`). Use kebab-case for new slugs
  (some older files use underscores; don't rename them, it would break URLs).
- Frontmatter (validated by `src/content.config.ts`):

```yaml
---
title: "Short, specific title"         # required
description: "One-sentence summary"   # required
pubDate: '2026-11-22'                  # required, ISO date
updatedDate: '2026-11-30'              # optional
heroImage: '/blog-placeholder-1.jpg'   # optional
tags: ['astro', 'blog']                # optional, lowercase kebab-case
featured: false                        # optional
featuredWeight: 0                      # optional, higher shows first
---
```

- Lab-notebook style is encouraged: context / what I tried / result / takeaways.
- Math: `$inline$` and `$$block$$` (KaTeX).
- When a post documents a change to this blog, add a line to [`changelog.md`](./changelog.md) linking to it.

## Rules

1. **Never push to `main`.** Work on a branch and open a PR.
2. **Run `npm run build` before opening a PR.** It must pass.
3. **Ask Tam before** any of these:
   - deleting, renaming or unpublishing posts (URLs are public)
   - changing deploy config, `astro.config.mjs` `site`/`base`, or the content schema
   - adding, removing or upgrading dependencies
   - deleting branches or rewriting git history
4. Don't rewrite Tam's posts' voice or conclusions; fix typos/formatting only unless asked.
5. Keep changes small and focused; one topic per PR.
6. Keep `TODO.md` and `PLAN.md` up to date when work is done or plans change.
