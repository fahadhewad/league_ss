# LoL Flash Tracker (manual overlay)

A lightweight, always-on-top overlay for **League of Legends** that lets you
**manually** track the enemy team's Flash cooldowns — like the side panel from
Porofessor / Overwolf, but with **zero connection to the game**.

It does **not** use the Live Client Data API, the LCU API, screen reading, or
memory reading. It's just a floating window with five buttons. You tap a bolt
when you see an enemy flash; it counts down. That makes it completely safe to
use under Riot's Terms of Service.

```
┌──────────────────────┐
│      ENEMY FLASH   ⚙ ×│
├──────────────────────┤
│  TOP            ⚡     │
│  JGL            ⚡     │
│  MID          (4:12)  │  ← on cooldown
│  BOT            ⚡     │
│  SUP            ⚡     │
└──────────────────────┘
```

## How to use

- **Left-click** a bolt → starts the 5:00 (300s) Flash cooldown for that role.
- **Right-click** a bolt → resets it back to ready (in case you mistapped).
- **Drag** the title bar to reposition the panel.
- **Ctrl/Cmd + Shift + Space** → hide/show the whole overlay.
- **⚙ (gear)** → change the cooldown. Presets:
  - `300` — base Flash
  - `254` — with the **Cosmic Insight** rune
  - `234` — Cosmic Insight **+ Ionian Boots of Lucidity**

  (Cooldown haste values shift slightly between patches; tweak the number field
  to whatever the current patch uses.)

The ring around each bolt drains as the cooldown ticks, and the timer pulses red
in the final 10 seconds so you know a gank/all-in window is opening.

## Important: League must be in Borderless mode

Overlays can only draw on top of games running in **Windowed** or **Borderless**
mode — not exclusive **Fullscreen**. In League:

> Settings → Video → **Window Mode: Borderless**

(Borderless looks identical to fullscreen but lets overlays show through.)

## Running it

You need [Node.js](https://nodejs.org) installed (v18+).

```bash
npm install
npm start
```

## Building a standalone app

This produces an installer/executable you can run without Node:

```bash
npm run dist        # builds for your current OS
npm run dist:win    # Windows portable .exe
npm run dist:mac    # macOS .dmg
```

Output lands in the `dist/` folder.

## Tech used

- **Electron** — gives the transparent, frameless, always-on-top window and
  packages to a native app for Windows/macOS/Linux.
- **HTML / CSS / vanilla JS** — the UI and the (very simple) countdown logic.
- **electron-builder** — packaging into a distributable app.

No game integration, no external services, no accounts.

## Project layout

| File           | Purpose                                                        |
| -------------- | ------------------------------------------------------------- |
| `main.js`      | Electron main process — creates the overlay window + hotkeys. |
| `preload.js`   | Secure bridge exposing window controls to the UI.             |
| `index.html`   | Panel markup.                                                  |
| `styles.css`   | Overlay styling (dark, translucent panel + icon states).     |
| `renderer.js`  | Builds the role rows and runs the cooldown timers.            |
| `assets/flash.png` | The official Flash summoner-spell icon (Riot Data Dragon). |

## Ideas to extend it

- Add a second spell per row (Teleport / Ignite / Heal) with its own cooldown.
- Add a "lock" toggle that makes the panel click-through during a teamfight
  (`window.overlay.setClickThrough(true)` is already wired up in `preload.js`).
- Per-role cooldown overrides (e.g. the enemy support running Cosmic Insight).
