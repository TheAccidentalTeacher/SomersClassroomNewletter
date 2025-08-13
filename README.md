# SomersClassroomNewletter

## Getting Started

1. Create and activate a virtual environment (PowerShell):

```powershell
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Generate a newsletter HTML:

```powershell
python -m newsletter.cli generate --data .\data\sample_week.yml --out .\out --open
```

Notes:
- Add your PNG assets to `assets/images/panther/` as `header.png`, `badge.png` to enrich the theme.
- API integrations are stubbed. Populate your `.env` from `.env.example` to enable providers next.

## Deploying to Netlify

Netlify will build the site by running the command defined in `netlify.toml`:

- Installs Python deps: `pip install -r requirements.txt`
- Generates HTML: `PYTHONPATH=src python -m newsletter.cli generate --data data/sample_week.yml --out out`
- Copies assets to the publish folder: `cp -R assets out/`

Publish directory: `out/`

Setup steps:
1. Push this repo to GitHub.
2. In Netlify, New site from Git â†’ pick this repo.
3. Use defaults (Netlify reads `netlify.toml`).
4. Set any API keys in Site settings â†’ Environment variables (optional for now).

After deploy, your site will serve the generated newsletter at `/index.html` with images from `/assets/...`.

![CI](https://github.com/TheAccidentalTeacher/SomersClassroomNewletter/actions/workflows/ci.yml/badge.svg)

