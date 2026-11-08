# 🛺 AutoVerse Rally

> **Offline 3-Lap Auto-Rickshaw Racing Game for Mobile & Desktop**  
> *BSERC GenAI Internship | Week 2 | Project 8 | Section B*

AutoVerse Rally is an offline-first arcade auto-rickshaw racing game built with vanilla HTML5 Canvas and the Web Audio API. It features zero remote network requests, zero external media dependencies, smooth lateral steering physics, an authentic Chennai-inspired visual atmosphere, an anti-cheat lap verification system, and persistent record tracking.

---

## 🎮 Controls

### 📱 Touch Controls (Phones & Tablets)
- **◀ Steer Left:** Steer the auto-rickshaw toward the left track boundary.
- **▶ Steer Right:** Steer the auto-rickshaw toward the right track boundary.
- **NITRO:** Activates an intense 2.2-second top speed boost (1.5× speed) with twin cyan exhaust flames.
- **⏸ Pause:** Pauses the race and freezes the elapsed timer.
- **🔊 / 🔇 Mute:** Toggles synthesized sound effects.

*Touch controls feature large thumb-friendly circular targets (>90px) positioned away from the track to prevent screen obstruction. Multi-touch and pointer cancellation are supported.*

### 💻 Keyboard Controls (Desktop)
| Action | Keybinding |
|---|---|
| **Steer Left** | `A` or `←` (Left Arrow) |
| **Steer Right** | `D` or `→` (Right Arrow) |
| **Nitro Boost** | `Space`, `W`, or `↑` (Up Arrow) |
| **Pause / Resume** | `P` or `Escape` |
| **Toggle Mute** | `M` |
| **Debug Hitboxes** | `H` (or tap the Lap chip in the HUD) |

---

## 🏁 Rules of the Race

1. **Automatic Longitudinal Drive:** The auto-rickshaw accelerates automatically along the track centerline parameter `s` up to top speed.
2. **Lateral Steering & Bounds:** Players smoothly steer lateral displacement `d`, clamped within visible road boundaries `[-42, 42]` on a 120px wide asphalt road.
3. **Obstacles & Penalties:**
   - **Traffic Cones:** Cause an instant 50% speed reduction (`sp *= 0.5`).
   - **Potholes:** Cause a severe 70% speed reduction (`sp *= 0.3`).
   - **Early Warning:** A floating `⚠` icon appears ahead of obstacles within reaction distance.
   - **Collision Cooldown:** A 1.2-second cooldown with rickshaw transparency flicker prevents multiple penalties from a single overlap. Collision affects velocity only—it never arbitrarily manipulates the race clock.
4. **Coins & Pickups:**
   - **🪙 Gold Coins:** Collected once per circuit; increment the coin counter.
   - **[N] Nitro Canisters:** Add +1 Nitro charge (maximum 2 charges; player starts with 1).
5. **Anti-Cheat Lap Logic:**
   - Completing a lap requires passing **Checkpoint 1** (`L / 3`) and **Checkpoint 2** (`2L / 3`) in strict sequence before crossing the start/finish line.
   - Reverse crossings and repeated finish-line overlaps are rejected.
   - Exactly **3 valid laps** are required to complete the race.
6. **Persistence & Records:**
   - Stored in `localStorage` under key `avr_v1`: `{ schemaVersion, bestTimeMs, soundEnabled, controlPreference, seen }`.
   - Only legitimately finished 3-lap races update the record. Slower or tied runs do not overwrite existing records.
   - Storage corruption or private-browsing restrictions fall back gracefully without crashes.

---

## 🚀 How to Launch & Play

### Desktop
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari). No web server, dependencies, or build tools are required!

### Android Phone (Offline Flight-Mode PWA)
1. Transfer `index.html`, `manifest.json`, and `sw.js` to your device (or host them on any local Wi-Fi / HTTPS server once).
2. Open the page in **Chrome for Android**.
3. Tap the browser menu (`⋮`) and select **"Add to Home screen"** or **"Install app"**.
4. Turn on **Airplane / Flight Mode** to disconnect all network access.
5. Launch **AutoVerse Rally** from your home screen. The game starts, plays, synthesizes audio, and saves records 100% offline!

---

## 🧪 Test Checklist & Verification Evidence

All acceptance criteria and edge cases have been validated using both automated headless tests (`test-sim.js`) and live manual flight-mode verification:

- [x] **Full 3-lap race in flight mode:** Tested and verified on mobile with 0 network calls.
- [x] **Touch steering + Nitro:** Independent pointer events, thumb-sized buttons, responsive input.
- [x] **Keyboard steering + Nitro:** Smooth multi-key input without uncontrollable repeat.
- [x] **Obstacles (cones & potholes):** Fair warning indicator, speed penalties, 1.2s cooldown.
- [x] **Coins & Nitro pickups:** Increment counters once per circuit; Nitro capped at 2.
- [x] **Pause / Resume & Auto-pause:** Timer accurately freezes; auto-pauses on tab switch or window blur.
- [x] **Lap logic & anti-cheat:** Rejects reverse crossing and missed checkpoints.
- [x] **Best time persistence:** Survives page refresh and browser restart; slower runs preserved.
- [x] **Mute persistence:** Audio toggle state persists across sessions.
- [x] **Orientation responsiveness:** Cleanly adapts between Portrait (90° canvas rotation) and Landscape.
- [x] **First-time onboarding:** Automatically displays "How to Play" for first-time players.

To run the automated acceptance test suite locally:
```bash
node test-sim.js
```
*Result: 22 Passed, 0 Failed.* Detailed test results and step-by-step demo transcripts are documented in [`test_evidence.md`](test_evidence.md).

---

## 📁 Project Architecture & Files

```
week_2 project 4/
├── index.html         # Complete game engine, UI, synthesized WebAudio, and canvas renderer
├── manifest.json      # Web App Manifest for Android PWA installation
├── sw.js              # Service Worker for 100% offline flight-mode caching
├── test-sim.js        # Automated Node.js test harness verifying all PRD criteria
├── test_evidence.md   # Comprehensive test matrix, edge-case audit, and demo transcript
├── prompts.md         # Generative AI prompts structured in milestone build order (1-8)
└── README.md          # Project overview, launch guide, controls, and rules
```

---

## 🛠️ Technical Details & Game Loop

- **Render Engine:** 2D Canvas vector rendering using parametric track space $(s, d)$.
- **Framerate & Physics:** `requestAnimationFrame` with a 50ms delta-time cap to eliminate physics tunneling.
- **Audio Synthesizer:** Pure Web Audio API oscillators (sine, square, sawtooth, triangle) with exponential gain ramps for zero-latency, asset-free sound.
- **Scenery:** Procedural Chennai-inspired coconut palms, chai stalls, auto stand boards, and rumble kerbs.
- **Orientation Handler:** Evaluates `innerHeight > innerWidth` on resize/orientation events, rotating canvas transforms by $90^\circ$ to fill portrait phone displays without aspect distortion.
