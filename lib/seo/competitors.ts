// Competitor facts shown on /vs and /alternatives pages. Only things a reader can check on the competitor's own site.
// Re-check every quarter and update CHECKED.

export const CHECKED = "November 2026";

export const COMPETITORS = {
  strong: {
    name: "Strong",
    site: "https://www.strong.app",
    job: "Workout logger: you build routines, it records sets",
    plan: "You write your own routines",
    free: "Free plan limited to 3 routines",
    price: "PRO $4.99/mo · $29.99/yr · $99.99 lifetime",
    platforms: "iPhone, Android, Apple Watch",
  },
  hevy: {
    name: "Hevy",
    site: "https://www.hevy.com",
    job: "Workout logger with a social feed",
    plan: "You write your own routines; Hevy Trainer is a paid add-on",
    free: "Free plan with a capped number of routines and limited graph history",
    price: "Pro $2.99/mo · $23.99/yr · $74.99 lifetime",
    platforms: "iPhone, Android, watch apps",
  },
  fitbod: {
    name: "Fitbod",
    site: "https://fitbod.me",
    job: "Generates each workout from your equipment, history and recovery",
    plan: "A new workout generated each session",
    free: "Free trial, then paid",
    price: "$15.99/mo · $95.99/yr",
    platforms: "iPhone, Android, Apple Watch",
  },
} as const;
