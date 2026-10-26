<h1 align="center">Shivani Kaushik — Portfolio</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite 5">
</p>

<p align="center"><b>Scrolling is the camera move.</b></p>

A scroll-driven portfolio for a Brand &amp; Communication Designer. A fixed illustration
sits behind the page; as you scroll the résumé, the view pushes in to the bandage on
her face that matches the entry you are reading. Below that, the works section turns
vertical scroll into a horizontal run of case studies, each opening full screen.

## Running it

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + bundle to dist/
npm run typecheck
npm run lint
```

## Layout

| Path | What's in it |
| --- | --- |
| `web/src/App.tsx` | Page shell, hero copy, overlays |
| `web/src/scene/Scene2D.tsx` | The illustration and its scroll-driven zoom |
| `web/src/ui/Resume.tsx` | Résumé timeline |
| `web/src/ui/Works.tsx` | Works index and full-screen detail |
| `web/src/ui/workBlocks.tsx` | Case-study blocks, written as fenced code blocks in markdown |
| `web/src/data/works.ts` | Section and work list |
| `web/src/content/works/*.md` | One file per case study (`example.md` is the template) |
| `web/public/works/<slug>/` | That case study's images and video |

## Deployment

Pushing to `main` builds `web/` and publishes to GitHub Pages
(`.github/workflows/deploy.yml`). Pages must be set to **Source: GitHub Actions**
in the repository settings.

Case-study video is kept out of git — see `web/.gitignore`.

## Credits

Built on [sen-3d-resume](https://github.com/dayinji/sen-3d-resume) by Sen Zheng,
MIT licensed. See `LICENSE` and `NOTICE`.
