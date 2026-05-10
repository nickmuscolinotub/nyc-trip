# NYC Trip · May 10–16, 2026

A solo NYC trip itinerary built as an installable web app. Interactive map, day-by-day stops, color-coded subway lines, walking routes from home base, hidden gems, photo spots, and visit tracking. Works offline.

## Use it on your phone

1. Open the deployed URL in iPhone Safari.
2. Tap **Share → Add to Home Screen**. The icon will appear on your home screen.
3. Open it once on wifi and tap each day tab — this pre-caches the map tiles.
4. After that, the app works fully offline (subway, airplane mode, anywhere).

## Files

| File | What |
|---|---|
| `index.html` | The whole app — HTML, CSS, JS in one file |
| `manifest.webmanifest` | PWA metadata so iOS treats it as a real app |
| `sw.js` | Service worker — caches the app shell + map tiles for offline use |
| `icon.svg` / `icon-180.png` / `icon-192.png` / `icon-512.png` | App icons |

## Stack
- [Leaflet](https://leafletjs.com/) for the map
- [Carto Voyager](https://carto.com/) tiles
- Inter / Inter Tight via Google Fonts
- Pure JS, no build step
