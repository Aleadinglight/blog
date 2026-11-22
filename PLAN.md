# Project plan

## Goal

A public lab notebook: Tam's learning notes and portfolio in one place.
Each post records a real problem, what was tried, what worked and what didn't,
so it's useful to future-Tam and shows how Tam thinks and works.

## Audience

1. **Future Tam**: searchable, honest notes to come back to.
2. **Other developers**: who hit the same problems (Astro, Next.js, Supabase, AWS, self-hosting).
3. **Recruiters / collaborators**: who want evidence of skills and judgment.

## Principles

- Everything lives in this repo: posts, plan, todo, changelog, agent rules.
- Get the foundation into its best shape before adding features.
- Small, reviewed PRs; `main` is always deployable.

## Milestones (in order)

| # | Milestone | Status | Done when |
| --- | --- | --- | --- |
| 1 | Foundation docs | In progress | `AGENTS.md`, `CLAUDE.md`, `TODO.md`, `PLAN.md`, cleaned `changelog.md` merged |
| 2 | Cleanup | Paused | Every item under "Cleanup" in `TODO.md` is resolved |
| 3 | Features | Not started | Wishlist items shipped, each with a post + changelog entry |
| 4 | Steady writing | Ongoing | Regular posts in lab-notebook format |

### Suggested feature order (milestone 3)

1. Tag filtering: makes the existing posts navigable
2. Post series: groups related notes (e.g. the Supabase posts)
3. Image optimization: replace placeholders with real, optimized images
4. Changelog page: shows the blog's own evolution
5. In-page search improvements (Pagefind already provides site search)

## Decisions log

- 2026-11-22: Plan, todo and agent rules live in the repo root. Placeholder cleanup paused until the foundation docs are merged.
