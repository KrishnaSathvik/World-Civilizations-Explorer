

## UI/UX Fixes Plan

### Issue 1: Simplify Search Bar Placeholder
**File**: `src/components/HeroSection.tsx`
- Change placeholder from `"Search civilizations, key figures, events..."` to `"Search civilizations"`

### Issue 2: Reduce Filter Clutter
**File**: `src/components/CivilizationGrid.tsx`
- Consolidate to a single row of era-based filters only: `["All", "Ancient", "Medieval", "Modern"]`
- Remove the 6 region filters entirely (All, Asia, Europe, Africa, Americas, Middle East) — they create visual overload and the era filter is more meaningful
- Remove the vertical divider between filter groups

### Issue 3: Map Not Visible (White on White)
**File**: `src/components/WorldMap.tsx`
- The map geography fill uses `hsl(var(--muted))` which is `36 15% 92%` — nearly identical to the card background `36 30% 95%`, making countries invisible
- Change the geography fill to a more contrasting color like `hsl(var(--border))` or a slightly darker tone, and increase opacity to 1.0
- Also darken the stroke for better country boundary visibility

### Issue 4: Births & Deaths Tabs Empty
**Root cause**: The API Ninjas `/v1/dayinhistory` endpoint returns a **flat array** of events (confirmed from network response), but `fetchDayInHistory()` in `src/services/apiNinjasService.ts` tries to access `data.events`, `data.births`, `data.deaths` as if the response is an object with those keys — they're all `undefined`.

**Fix in** `src/services/apiNinjasService.ts`:
- The `dayinhistory` endpoint only returns general events as a flat array, not separated births/deaths
- Use the Muffinlabs/Wikipedia data (which already has births and deaths from `fetchTodayInHistory`) for the births and deaths tabs instead
- Update `ThisWeekInHistory.tsx` to source births and deaths from the wiki query (`wikiQuery.data`) rather than the ninjas query, since the Muffinlabs API at `history.muffinlabs.com` returns `{ data: { Events, Births, Deaths } }`

**File**: `src/services/api.ts` — check if `fetchTodayInHistory` already parses births/deaths from Muffinlabs. If not, extend it to include them.

**File**: `src/components/ThisWeekInHistory.tsx` — wire births/deaths tabs to `wikiQuery.data.births` and `wikiQuery.data.deaths` instead of `ninjasQuery`.

### Technical Details

- The Muffinlabs API (`http://history.muffinlabs.com/date`) returns births and deaths natively, so no new API calls needed
- The `EventCard` component has a ref warning — will be fixed by not wrapping it in `motion.div` with `variants` or by using `forwardRef`

