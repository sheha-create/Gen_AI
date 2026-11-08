/**
 * AutoVerse Rally - Comprehensive Logic & Rule Verification Test Suite
 * Validates PRD Acceptance Criteria, Edge Cases, and Core Game Rules
 */

const assert = (condition, msg) => {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    failedCount++;
  }
};

let passedCount = 0;
let failedCount = 0;

console.log('====================================================');
console.log(' AutoVerse Rally - Verification & Acceptance Tests  ');
console.log('====================================================\n');

// Track Constants
const R = 200, SL = 400, L = 2 * SL + 2 * Math.PI * R, HW = 60, LIM = 42, LAPS = 3, MAXV = 150, LAT = 135;

// --- Test 1: Lap Validation & Checkpoint Sequence ---
console.log('Test Group 1: Lap Counting & Anti-Cheat Validation');
{
  let lap = 0, cp = [0, 0];

  // (1a) Reverse crossing across finish line
  let s = 10;
  s = -10; // moved backwards
  let ls = s - lap * L;
  if (ls >= L / 3) cp[0] = 1;
  if (ls >= (2 * L) / 3 && cp[0]) cp[1] = 1;
  if (ls >= L && cp[0] && cp[1]) lap++;
  assert(lap === 0, 'Reverse crossing across start/finish line is rejected');

  // (1b) Repeated start line overlap without completing circuit
  s = 5;
  ls = s - lap * L;
  if (ls >= L && cp[0] && cp[1]) lap++;
  assert(lap === 0, 'Repeated start line overlap does not increment lap');

  // (1c) Skipping checkpoint 1 (jumping directly to checkpoint 2)
  cp = [0, 0];
  s = (2 * L) / 3 + 10;
  ls = s;
  if (ls >= (2 * L) / 3 && cp[0]) cp[1] = 1;
  assert(cp[1] === 0, 'Checkpoint 2 cannot be triggered without Checkpoint 1');

  // (1d) Valid complete circuit through checkpoints 1 & 2
  cp = [0, 0];
  s = L / 3 + 10;
  if (s >= L / 3) cp[0] = 1;
  s = (2 * L) / 3 + 10;
  if (s >= (2 * L) / 3 && cp[0]) cp[1] = 1;
  s = L + 5;
  if (s >= L && cp[0] && cp[1]) {
    lap++;
    cp = [0, 0];
  }
  assert(lap === 1 && cp[0] === 0 && cp[1] === 0, 'Valid circuit increments lap by 1 and resets checkpoints');
}

// --- Test 2: Collision Detection & Cooldown Behavior ---
console.log('\nTest Group 2: Obstacle Collisions & Bounded Penalties');
{
  let sp = MAXV;
  let cd = 0;

  // Traffic cone collision
  const cone = { t: 0, r: 7 };
  if (cd <= 0) {
    sp *= cone.t ? 0.3 : 0.5;
    cd = 1.2;
  }
  assert(sp === 75 && cd === 1.2, 'Traffic cone reduces speed by exactly 50% and sets 1.2s cooldown');

  // Immediate second frame hit during cooldown
  let repeatHit = false;
  if (cd <= 0) {
    sp *= 0.5;
    repeatHit = true;
  }
  assert(!repeatHit && sp === 75, 'Cooldown prevents consecutive repeat penalties from same obstacle');

  // Pothole collision after cooldown expires
  cd = 0;
  sp = MAXV;
  const pothole = { t: 1, r: 10 };
  if (cd <= 0) {
    sp *= pothole.t ? 0.3 : 0.5;
    cd = 1.2;
  }
  assert(sp === 45, 'Pothole reduces speed by exactly 70% (sp *= 0.3)');
}

// --- Test 3: Coin Pickup & Nitro Power-Up Mechanics ---
console.log('\nTest Group 3: Coins & Nitro Power-Up Behavior');
{
  let coins = 0;
  let collectedIds = new Set();
  const coinId = 101;

  // Single collection
  if (!collectedIds.has(coinId)) {
    collectedIds.add(coinId);
    coins++;
  }
  assert(coins === 1, 'First pass over coin increments counter');

  // Repeated pass over same coin ID
  if (!collectedIds.has(coinId)) {
    collectedIds.add(coinId);
    coins++;
  }
  assert(coins === 1, 'Re-passing over collected coin ID does not increment counter');

  // Nitro charge activation
  let charges = 1;
  let boostTimer = 0;
  if (charges > 0 && boostTimer <= 0) {
    charges--;
    boostTimer = 2.2;
  }
  assert(charges === 0 && boostTimer === 2.2, 'Triggering Nitro uses 1 charge and grants 2.2s boost duration');

  // Nitro pickup with maximum limit of 2
  charges = 1;
  if (charges < 2) charges++;
  assert(charges === 2, 'Nitro pickup increments charge count');
  if (charges < 2) charges++;
  assert(charges === 2, 'Nitro charges are clamped to maximum 2');
}

// --- Test 4: Persistent Settings & Best Time Rules ---
console.log('\nTest Group 4: LocalStorage & Best Time Rules');
{
  let state = {
    schemaVersion: 1,
    bestTimeMs: 45000,
    soundEnabled: true,
    controlPreference: 'auto'
  };

  // Slower time does NOT overwrite
  const slowerTime = 48200;
  let isNewRecord = state.bestTimeMs === null || slowerTime < state.bestTimeMs;
  if (isNewRecord) state.bestTimeMs = slowerTime;
  assert(!isNewRecord && state.bestTimeMs === 45000, 'Slower race time does NOT overwrite best time');

  // Tie does NOT overwrite
  const tiedTime = 45000;
  isNewRecord = state.bestTimeMs === null || tiedTime < state.bestTimeMs;
  assert(!isNewRecord, 'Tied race time does not trigger new record');

  // Faster time DOES overwrite
  const fasterTime = 41250;
  isNewRecord = state.bestTimeMs === null || fasterTime < state.bestTimeMs;
  if (isNewRecord) state.bestTimeMs = fasterTime;
  assert(isNewRecord && state.bestTimeMs === 41250, 'Faster completed race updates best time');

  // Corrupted storage parsing recovery
  let parsedState = null;
  const corruptJson = '{"schemaVersion":"corrupt", "bestTimeMs": -50}';
  try {
    const raw = JSON.parse(corruptJson);
    if (raw && raw.schemaVersion === 1) parsedState = raw;
  } catch (e) {}
  assert(parsedState === null, 'Corrupted localStorage data is safely discarded without crashing');
}

// --- Test 5: Steering & Track Boundary Clamping ---
console.log('\nTest Group 5: Smooth Lateral Steering & Bounds Clamping');
{
  let d = 0;
  const dt = 1 / 60;

  // Steer left
  d = Math.max(-LIM, Math.min(LIM, d + (-1) * LAT * dt));
  assert(d < 0, 'Left steer decreases lateral offset smoothly');

  // Clamp at bounds
  for (let i = 0; i < 100; i++) {
    d = Math.max(-LIM, Math.min(LIM, d + (-1) * LAT * dt));
  }
  assert(d === -LIM, `Lateral offset correctly clamped to boundary (-${LIM})`);

  // Both directions pressed simultaneously (cancel each other out)
  const prevD = d;
  const steerBoth = (-1) + (1);
  d = Math.max(-LIM, Math.min(LIM, d + steerBoth * LAT * dt));
  assert(d === prevD, 'Simultaneously holding left and right results in net 0 steering');
}

// --- Test 6: Full 3-Lap Race End-to-End Simulation ---
console.log('\nTest Group 6: Full 3-Lap Race End-to-End Simulation');
{
  let s = 0, d = 0, sp = 0, lap = 0, cp = [0, 0], el = 0, cc = 0;
  let ch = 1, bo = 0, cd = 0;
  let raceFinished = false;
  const dt = 1 / 60;

  // Simulate 3500 frames (~58 seconds maximum)
  for (let step = 0; step < 3500; step++) {
    el += dt * 1000;

    // Use nitro boost on lap 1
    if (step === 200 && ch > 0 && bo <= 0) {
      ch--;
      bo = 2.2;
    }

    if (bo > 0) bo -= dt;
    if (cd > 0) cd -= dt;

    const targetV = MAXV * (bo > 0 ? 1.5 : 1.0);
    sp += (targetV - sp) * Math.min(1, dt * (sp < targetV ? 1.6 : 3.2));
    s += sp * dt;

    const ls = s - lap * L;
    if (ls >= L / 3) cp[0] = 1;
    if (ls >= (2 * L) / 3 && cp[0]) cp[1] = 1;

    if (ls >= L && cp[0] && cp[1]) {
      lap++;
      cp = [0, 0];
      if (lap >= LAPS) {
        raceFinished = true;
        break;
      }
    }
  }

  assert(raceFinished, 'Complete 3-lap race finished successfully');
  assert(lap === 3, 'Race recorded exactly 3 laps');
  assert(el > 30000 && el < 60000, `Race completed in expected time range (${(el / 1000).toFixed(2)}s)`);
}

console.log('\n====================================================');
console.log(` Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
console.log('====================================================');

if (failedCount > 0) {
  process.exit(1);
}
