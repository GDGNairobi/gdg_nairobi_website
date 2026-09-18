import * as migration_20260917_221459_railway_baseline from './20260917_221459_railway_baseline';
import * as migration_20260917_231324_gdg_community_homepage from './20260917_231324_gdg_community_homepage';
import * as migration_20260917_231914_seed_organizers from './20260917_231914_seed_organizers';
import * as migration_20260917_233522_seed_chapter_partners_and_events from './20260917_233522_seed_chapter_partners_and_events';
import * as migration_20260918_035500_add_official_website_links from './20260918_035500_add_official_website_links';

export const migrations = [
  {
    up: migration_20260917_221459_railway_baseline.up,
    down: migration_20260917_221459_railway_baseline.down,
    name: '20260917_221459_railway_baseline',
  },
  {
    up: migration_20260917_231324_gdg_community_homepage.up,
    down: migration_20260917_231324_gdg_community_homepage.down,
    name: '20260917_231324_gdg_community_homepage',
  },
  {
    up: migration_20260917_231914_seed_organizers.up,
    down: migration_20260917_231914_seed_organizers.down,
    name: '20260917_231914_seed_organizers',
  },
  {
    up: migration_20260917_233522_seed_chapter_partners_and_events.up,
    down: migration_20260917_233522_seed_chapter_partners_and_events.down,
    name: '20260917_233522_seed_chapter_partners_and_events'
  },
  {
    up: migration_20260918_035500_add_official_website_links.up,
    down: migration_20260918_035500_add_official_website_links.down,
    name: '20260918_035500_add_official_website_links'
  },
];
