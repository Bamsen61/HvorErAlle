import test from "node:test";
import assert from "node:assert/strict";
import {
  USERS,
  parseLocation,
  parseTimestamp,
  formatTimestamp,
  freshnessClass,
  googleMapsUrl,
  detectPlatform,
  accuracyLabel
} from "../site/js/core.mjs";

test("all 11 invitation keys are present and user 4 remains text", () => {
  assert.equal(Object.keys(USERS).length, 11);
  assert.equal(USERS.J2ZrXMP0wj, "4");
});

test("locations are parsed and invalid coordinates are rejected", () => {
  assert.deepEqual(parseLocation("50.05, 19.91"), { lat: 50.05, lng: 19.91 });
  assert.equal(parseLocation("91, 10"), null);
  assert.equal(parseLocation(""), null);
  assert.equal(parseLocation(null), null);
});

test("timestamps use the required format and reject invalid dates", () => {
  const date = new Date(2026, 6, 4, 10, 10, 10);
  assert.equal(formatTimestamp(date), "2026-07-04 10:10:10");
  assert.equal(parseTimestamp("2026-02-30 10:10:10"), null);
});

test("marker freshness uses green, yellow and red boundaries", () => {
  const now = new Date(2026, 6, 4, 11, 0, 0);
  assert.equal(freshnessClass("2026-07-04 10:40:00", now), "fresh");
  assert.equal(freshnessClass("2026-07-04 10:39:59", now), "aging");
  assert.equal(freshnessClass("2026-07-04 10:15:00", now), "aging");
  assert.equal(freshnessClass("2026-07-04 10:14:59", now), "stale");
});

test("Google Maps coordinates are encoded as one query value", () => {
  assert.equal(googleMapsUrl(50.05, 19.91), "https://www.google.com/maps/search/?api=1&query=50.05%2C19.91");
});

test("platform and accuracy labels follow the supported values", () => {
  assert.equal(detectPlatform("Mozilla Android"), "Android");
  assert.equal(detectPlatform("Mozilla iPhone"), "IOS");
  assert.equal(detectPlatform("Mozilla", "Win32", 0), "Ukjent");
  assert.equal(accuracyLabel(30), "Fine");
  assert.equal(accuracyLabel(250), "Coarse");
});
