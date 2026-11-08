# AutoVerse Rally - Prompts Log (Build Order)

This document records the exact generative AI prompts used to design, implement, test, and polish **AutoVerse Rally** in accordance with the 8 implementation milestones specified in the PRD.

---

## Milestone 1: Project Shell, Canvas Scaling, Game States & Title Screen
**Prompt 1.1:**
> "Create an offline-first single-file HTML5 canvas game shell for 'AutoVerse Rally', an auto-rickshaw racing game. Include a high-contrast viewport, CSS reset to prevent pull-to-refresh or touch bounce, and an explicit finite state machine with states: `menu`, `instructions`, `countdown`, `racing`, `paused`, and `finished`. Provide a title screen showing the game name, best record time, Start Race, How to Play, controls mode selector, and sound mute toggle."

---

## Milestone 2: Looping Road, Auto Rendering, Steering & Track Boundaries
**Prompt 2.1:**
> "Implement a continuous closed-loop stadium racetrack in 2D HTML5 canvas defined by straight parameter `SL = 400` and curved turn radius `R = 200` with track width `2 * HW = 120`. Represent track position with longitudinal distance `s` and lateral offset `d`. Render an authentic Indian auto-rickshaw sprite with canary-yellow cowl, dark green canopy roof, 3 wheels (1 front, 2 rear), windshield, and headlight beam. Implement smooth lateral steering clamped strictly within road boundaries `[-LIM, LIM]`."

---

## Milestone 3: Countdown, Timer, Checkpoint/Lap Logic & 3-Lap Finish
**Prompt 3.1:**
> "Add a 3-2-1-GO! audio-visual race countdown. Implement elapsed time tracking in milliseconds that begins on 'GO!', freezes during pause, and stops at the finish line. Implement robust anti-cheat lap counting requiring the player to cross Checkpoint 1 (`L/3`) and Checkpoint 2 (`2L/3`) in strict sequential order before crossing the start/finish line. Reject reverse crossings and repeated start-line overlap. Trigger the race finish state upon completing exactly 3 valid laps."

---

## Milestone 4: Coins, Obstacles, Collision Penalties & Nitro Power-Up
**Prompt 4.1:**
> "Generate track hazards and pickups:
> 1. Traffic cones (orange with reflective stripe) causing a 50% speed reduction.
> 2. Asphalt potholes causing a 70% speed reduction.
> 3. Display an early warning `⚠` symbol overhead when approaching hazards.
> 4. Add a 1.2s collision cooldown with player visual flicker to prevent multiple penalties from one overlap. Speed should recover smoothly without altering the race timer directly.
> 5. Place collectable gold coins that increment the counter exactly once per circuit.
> 6. Add blue 'N' Nitro canisters (+1 boost charge, max 2). Activating Nitro gives a 2.2s speed boost (1.5x max speed) accompanied by twin blue exhaust flame graphics."

---

## Milestone 5: Keyboard / Touch Controls, Responsive HUD & Pause System
**Prompt 5.1:**
> "Build dual input schemes:
> 1. Desktop Keyboard: Arrow Left / Right or A / D to steer, Space / W / Up for Nitro, P / Esc for Pause, M for Mute, H for debug hitboxes. Prevent key repeat on toggle actions.
> 2. Mobile Touch: Visible, thumb-sized circular touch buttons (`◀`, `▶`, and `NITRO`) with pointer capture and multitouch safety positioned outside the critical track area.
> 3. Add a HUD showing Lap count (1/3), formatted elapsed time (mm:ss.cs), coin count, and Nitro status.
> 4. Implement a Pause menu with Resume and a 2-step confirmation on 'Quit to Menu'."

---

## Milestone 6: Best-Time Persistence, Synthesized Web Audio & Mute
**Prompt 6.1:**
> "Implement client-side persistence in `localStorage` under key `avr_v1` storing `{ schemaVersion: 1, bestTimeMs, soundEnabled, controlPreference, seen }`. Ensure new records only update on valid 3-lap completions, and slower or tied runs do not overwrite existing records. Synthesize all sound effects via Web Audio API (countdown beeps, GO tone, engine hum, coin chime, nitro whoosh, crash thud, lap chime, victory fanfare) with 0 external audio files. Add visible mute buttons that synchronize and persist state."

---

## Milestone 7: Responsive / Offline Packaging & Flight-Mode Optimization
**Prompt 7.1:**
> "Package the game for seamless offline play on real Android phones in flight mode. Add a Web App Manifest (`manifest.json`) and a caching Service Worker (`sw.js`). Handle portrait and landscape orientations dynamically by rotating the canvas 90 degrees in portrait to utilize full phone screen dimensions. Disable touch gestures, pinch-zoom, and context menus. Auto-pause the game on window blur or `visibilitychange` (tab switch)."

---

## Milestone 8: Chennai Scenery, Fairness Tuning & Verification Test Suite
**Prompt 8.1:**
> "Enrich the track with lightweight procedural Chennai-inspired scenery: roadside coconut palm trees, red-white rumble curb strips, 'CHAI POINT' tea kiosk, and 'AUTO STAND' roadside board. Add an automated test script (`test-sim.js`) that headlessly verifies all acceptance criteria: lap counting anti-cheat, collision cooldown, coin single-collection, nitro boost, tie handling, corrupt storage fallback, and 3-lap race completion. Prepare full test documentation and demo replay evidence."
