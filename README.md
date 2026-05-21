# Volume Profile Web App

A mobile-first single-page volume profile viewer built in plain HTML/JS.

## Files

- `index.html` — main app UI and Supabase integration
- `manifest.json` — PWA metadata for installable mobile/web app
- `icon.svg` — app icon for PWA/home screen

## Setup

1. Open `index.html` in a browser.
2. In `index.html`, replace the placeholder:
   ```js
   const SUPABASE_ANON_KEY = "REPLACE_WITH_ANON_KEY";
   ```
   with your Supabase project's anon key.
3. Save and refresh the page.

## Features

- `VOL` / `VEL` mode toggle
- Instrument selector: `GC`, `CL`, `ES`
- Time window selector: `1h`, `2h`, `3h`, `4h`, `5h`, `London`, `NY`
- Histogram rows with price, bar, volume/velocity and delta%
- Tap/click row selection and tooltip panel
- Live Supabase RPC call to `get_volume_profile`
- Sample fallback data when anon key is not configured

## GitHub Pages

To deploy on GitHub Pages:

1. Add the repository to GitHub.
2. Set Pages source to the repository root.
3. Ensure `index.html`, `manifest.json`, and `icon.svg` are in the project root.

## Notes

- `index.html` is intentionally standalone and uses only CDN dependencies.
- The app shows sample data until a valid Supabase anon key is configured.
