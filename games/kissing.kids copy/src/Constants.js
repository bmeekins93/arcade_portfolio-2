// Round + wave pacing (seconds)
export const ROUND_DURATION = 120;
export const WAVE_DURATION = 10;

// Spawn tuning (seconds, counts, geometry)
export const SPAWN_INTERVAL_BASE = 3.33;
export const SPAWN_INTERVAL_MIN = 1.00;
export const SPAWN_COUNT_CAP = 10;
export const MAX_ACTIVE_BABIES = 50;
export const MIN_SPAWN_SEPARATION = 50; // pixels
export const HEAD_EXCLUSION_RADIUS_FACTOR = 1.2;

// Targeting + clear timing (seconds unless noted)
export const SNAP_RADIUS_PERCENT = 0.18; // fraction of min(canvas.width, canvas.height)
export const KISS_FACE_TIME = 0.25;
export const BABY_DESPAWN_DELAY = 0.05;
export const VAP_FLASH_TIME = 0.15;

// Charge + streak tuning (seconds)
export const BASE_CHARGE = 0.06;
export const STREAK_CHARGE = 0.01;
export const STREAK_WINDOW = 2.0;

// Gayray tuning (seconds, percent of width)
export const GAYRAY_DURATION = 5.0;
export const GAYRAY_WIDTH_PERCENT = 0.06;

// Audio ducking (dB)
export const CRY_DUCK_KISS = -6; // dB, but simulate
export const CRY_DUCK_GAYRAY = -4; // dB
