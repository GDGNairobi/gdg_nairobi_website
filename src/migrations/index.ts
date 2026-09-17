import * as migration_20260917_221459_railway_baseline from './20260917_221459_railway_baseline';
import * as migration_20260917_231324_gdg_community_homepage from './20260917_231324_gdg_community_homepage';

export const migrations = [
  {
    up: migration_20260917_221459_railway_baseline.up,
    down: migration_20260917_221459_railway_baseline.down,
    name: '20260917_221459_railway_baseline',
  },
  {
    up: migration_20260917_231324_gdg_community_homepage.up,
    down: migration_20260917_231324_gdg_community_homepage.down,
    name: '20260917_231324_gdg_community_homepage'
  },
];
