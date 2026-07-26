# Campus Comfort Map

A web app that visualizes microclimate sensor readings (temperature, humidity, light) across University of Waterloo campus locations, and flags spots that could use shade or other heat mitigation. Built for SYDE 361.

## Try it out

**Requirements:** [Node.js](https://nodejs.org/) 20+ and npm.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## What to click on

- **Pins on the map** — click a colored pin to open its detail card: live temperature/humidity/light charts, a comfort status, and a shading suggestion when a spot runs hot.
- **Locations panel (top-left)** — lists every sensor with its current readings; click a row to jump to that pin. Switch to the **Historical Data** tab for a 7-day temperature trend per location.
- **Time range tabs** in a location's detail card — toggle between Live Readings, 7D, 30D, and All to see how a spot trends over time.
- Pin color = comfort status: green is comfortable, orange is warm, red is hot (see the legend under the Historical Data tab).

Eight of the nine locations use deterministic mock data so the demo looks the same every time. One pin, **"Live Sensor (Test Feed)"**, is wired up to a real exported dataset from a physical sensor prototype (`src/lib/data/test-location-export.json`) via `src/lib/firebase-data.ts` — in production this would read live from Firebase Realtime Database instead of a static file.

## Project structure

```
src/
  app/                 Next.js app router entry (layout, page, global styles)
  components/
    ComfortMap.tsx      top-level layout: map + panels + popup positioning
    CampusMap.tsx        campus image + sensor pins
    LocationsPanel.tsx    location list / historical trend list
    LocationDetailCard.tsx per-location popup with charts
    LineChart.tsx         small SVG line chart used throughout
  lib/
    climate-data.ts      sensor locations, comfort thresholds, series generation
    firebase-data.ts      reads raw sensor readings (stand-in for Firebase)
    data/                 static exported readings
```

## Other commands

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```
