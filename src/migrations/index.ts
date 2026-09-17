import * as migration_20260917_221459_railway_baseline from './20260917_221459_railway_baseline';

export const migrations = [
  {
    up: migration_20260917_221459_railway_baseline.up,
    down: migration_20260917_221459_railway_baseline.down,
    name: '20260917_221459_railway_baseline'
  },
];
