import * as migration_20260917_221459_railway_baseline from './20260917_221459_railway_baseline';
import * as migration_20260917_231324_gdg_community_homepage from './20260917_231324_gdg_community_homepage';
import * as migration_20260917_231914_seed_organizers from './20260917_231914_seed_organizers';
import * as migration_20260917_233522_seed_chapter_partners_and_events from './20260917_233522_seed_chapter_partners_and_events';
import * as migration_20260918_035500_add_official_website_links from './20260918_035500_add_official_website_links';
import * as migration_20260918_062217_add_event_schedules from './20260918_062217_add_event_schedules';
import * as migration_20260918_062254_add_schedule_start_control from './20260918_062254_add_schedule_start_control';
import * as migration_20260918_064738_improve_event_operations from './20260918_064738_improve_event_operations';
import * as migration_20260918_064823_allow_local_events from './20260918_064823_allow_local_events';
import * as migration_20260918_065620_add_homepage_highlights from './20260918_065620_add_homepage_highlights';
import * as migration_20260918_070008_unify_devfest_event from './20260918_070008_unify_devfest_event';

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
    name: '20260917_233522_seed_chapter_partners_and_events',
  },
  {
    up: migration_20260918_035500_add_official_website_links.up,
    down: migration_20260918_035500_add_official_website_links.down,
    name: '20260918_035500_add_official_website_links',
  },
  {
    up: migration_20260918_062217_add_event_schedules.up,
    down: migration_20260918_062217_add_event_schedules.down,
    name: '20260918_062217_add_event_schedules',
  },
  {
    up: migration_20260918_062254_add_schedule_start_control.up,
    down: migration_20260918_062254_add_schedule_start_control.down,
    name: '20260918_062254_add_schedule_start_control',
  },
  {
    up: migration_20260918_064738_improve_event_operations.up,
    down: migration_20260918_064738_improve_event_operations.down,
    name: '20260918_064738_improve_event_operations',
  },
  {
    up: migration_20260918_064823_allow_local_events.up,
    down: migration_20260918_064823_allow_local_events.down,
    name: '20260918_064823_allow_local_events',
  },
  {
    up: migration_20260918_065620_add_homepage_highlights.up,
    down: migration_20260918_065620_add_homepage_highlights.down,
    name: '20260918_065620_add_homepage_highlights',
  },
  {
    up: migration_20260918_070008_unify_devfest_event.up,
    down: migration_20260918_070008_unify_devfest_event.down,
    name: '20260918_070008_unify_devfest_event'
  },
];
