---
title: Example Work
banner: /works/example/banner.jpg
year: 2026
role: Design / Development
tags: [Interactive, Example tag]
link: https://example.com
---

> **This is a template for a work detail page.** Copy it to `src/content/works/<slug>.md`,
> where `<slug>` matches the `slug` on one of the items in `src/data/works.ts`. That work
> will then open as a full detail page; without a matching file it falls back to the shared
> placeholder. This file's slug is `example`, which matches nothing, so it never appears on
> the live site — it is here for reference only.

## A subheading

The body supports standard Markdown: **bold**, *italic*, [links](https://example.com) and
lists:

- First point
- Second point
- Third point

## Images and video

Put media under `public/works/<slug>/` and reference it with an absolute `/works/...` path.
Videos are kept out of git by default — see `.gitignore`:

![Example image](/works/example/1.jpg)

<video src="/works/example/demo.mp4" autoplay muted loop playsinline></video>

---

Available frontmatter fields, all optional:

| Field | Meaning |
| --- | --- |
| `title` | Detail heading (falls back to the work's name in works.ts) |
| `banner` | Path to the top banner image (a gradient is used if absent) |
| `year` | Year |
| `role` | Role / credit |
| `tags` | Array of tags, e.g. `[Branding, Packaging]` |
| `link` | External URL, rendered as a "visit" button |
