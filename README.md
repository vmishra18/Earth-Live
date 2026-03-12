# Live Earth Dashboard

Live Earth Dashboard is an Expo app built around the idea of tracking global activity in one place. It mixes simulated telemetry with a few live public data sources and presents everything through a mobile-first dashboard.

The app includes an overview screen, a world map, an alerts screen, and a replay screen for recent snapshots.

<img width="250" height="250" alt="Overview-Dark" src="https://github.com/user-attachments/assets/49996614-a8e8-4b29-b554-b05f45332925" />

<img width="250" height="250" alt="Overview-light" src="https://github.com/user-attachments/assets/bbc4df93-c7b7-4bbd-8c7d-214615fd4d4a" />

<img width="250" height="250" alt="Alert-Screen" src="https://github.com/user-attachments/assets/1432f78a-b9bd-4cb3-afff-421981c61ac1" />

<img width="250" height="250" alt="Map-Screen" src="https://github.com/user-attachments/assets/6f3dbbed-2f0d-4c51-b922-bcebd35915aa" />

<img width="250" height="250" alt="Replay-Screen" src="https://github.com/user-attachments/assets/0b3b1542-54d1-4170-932f-33e597a58fce" />

## What the app does

- Shows a dashboard with key metrics, trends, and region highlights
- Displays a world view with map layers for earthquakes, flights, weather, markets, and satellites
- Supports alert search, severity filtering, category filtering, and watch regions
- Saves settings, watchlists, and recent snapshots locally with AsyncStorage
- Includes local notifications for critical alerts
- Supports `auto`, `live`, and `demo` data modes

## Main screens

### Overview

The overview screen is the main dashboard. It shows active signals, alert count, coverage, key metrics, a short activity chart, and region cards that link to events.

### Globe / World View

The globe screen is the map view of the app. On native platforms it uses `react-native-maps`, and on web it switches to a custom orbital-style view. Users can turn layers on and off and open linked events from the map.

### Alerts

The alerts screen works like a small incident feed. It supports search, severity filters, category filters, and quick watch actions.

### Replay

The replay screen uses locally stored history to show recent snapshots in timeline form.

## Data model

This project uses both generated telemetry and live public sources.

### Live public sources

- `USGS` for earthquake activity
- `OpenSky Network` for flight state snapshots
- `Open-Meteo` for current weather data from tracked cities
- `Stooq` for a lightweight market basket snapshot

### Simulated feeds

- Ocean conditions
- Satellite coverage
- Any category or metric that cannot be refreshed from a live source at runtime

If a live request fails, the app falls back to generated telemetry and clearly labels the current source state in the UI. That keeps the experience stable in demos, on unreliable networks, or when public endpoints throttle or fail.
If a live request fails, the app falls back to generated telemetry and labels the source state in the UI.

## Tech stack

- Expo SDK 54
- React 19
- React Native 0.81
- TypeScript
- TanStack Query for refresh orchestration and cache lifecycle
- AsyncStorage for persisted settings, watchlists, and replay history
- Expo Notifications and Expo Background Task for local alert behavior
- `react-native-maps` for native map rendering

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- Expo-compatible iOS Simulator, Android Emulator, or Expo Go / development environment

### Installation

```bash
npm install
```

### Run the project

```bash
npm run start
```

Then choose one of the platform targets from the Expo prompt:

```bash
npm run ios
npm run android
npm run web
```

## Available scripts

```bash
npm run start
npm run ios
npm run android
npm run web
npm run typecheck
```

## How it works

### Data modes

- `auto`: tries live sources first and falls back to generated telemetry when needed
- `live`: prioritizes live requests and labels the UI when it has to degrade to fallback data
- `demo`: skips network refresh and runs entirely from generated dashboard state

### Caching and replay

Dashboard snapshots are stored locally for each data mode. On launch, the app restores the latest cached state and then refreshes it. A rolling history is kept for the replay screen.

### Alerts and notifications

Critical alerts can trigger local notifications and haptic feedback. Background refresh is best-effort and depends on platform support and OS behavior.

## Project structure

```text
.
├── App.tsx
├── app.json
├── src
│   ├── components
│   ├── constants
│   ├── data
│   ├── hooks
│   ├── screens
│   ├── services
│   ├── utils
│   ├── theme.ts
│   └── themeContext.tsx
└── package.json
```

### Key files

- `App.tsx` wires together the app shell, screen switching, overlays, and theme context
- `src/data/liveEarth.ts` generates the base dashboard state and shared data types
- `src/services/liveFeeds.ts` fetches public live data and maps it into the app's patch format
- `src/hooks/useDashboardData.ts` handles refresh timing, persistence, restoration, and fallback behavior
- `src/hooks/useDashboardControls.ts` manages user-facing controls such as filters, watchlists, and settings
- `src/services/notifications.ts` manages local notification delivery
- `src/services/backgroundRefresh.ts` defines and registers the background refresh task

## Current limitations

- This is still a frontend-heavy prototype, not a production monitoring platform
- Public APIs can be rate-limited, delayed, or unavailable without notice
- Ocean and satellite views are simulated rather than backed by real-time feeds
- Background execution and notification behavior vary across simulator, device, OS version, and Expo runtime constraints
- There is no authenticated backend, user account system, or remote persistence layer
