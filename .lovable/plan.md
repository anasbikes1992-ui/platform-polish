

# Comprehensive Platform Enhancement Plan

## Summary of Changes

This plan covers 7 major feature areas across ~15 files, plus 1 database migration.

---

## 1. Wanted Listings — Open to All Roles (Customer/Broker/Owner)

Currently the "Post Wanted Ad" button on PropertyPage only shows for owners/brokers. The fix is simple: remove the role restriction so any authenticated user can post a wanted ad (customers looking for properties, brokers seeking on behalf of clients, owners looking for land swaps).

**File:** `src/pages/PropertyPage.tsx`
- Remove the `currentUser === "owner" || currentUser === "broker"` guard on the "Post Wanted Ad" button
- Keep LankaPay fee flow as-is (Rs. 8,500)

---

## 2. Reviews & Ratings System

Create a `reviews` database table and a reusable `ReviewSection` component.

**Database migration:**
```sql
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text NOT NULL,
  listing_type text NOT NULL, -- stay, vehicle, event
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
-- Anyone authenticated can read reviews
-- Users can insert their own reviews
-- Users can update/delete their own reviews
```

**New file:** `src/components/ReviewSection.tsx`
- Fetches reviews for a given listing_id/listing_type
- Shows average rating, star breakdown, individual reviews
- Authenticated users can submit a review (1-5 stars + comment)
- Integrated into StaysPage, VehiclesPage, EventsPage detail modals

---

## 3. Social Sharing Buttons

**New file:** `src/components/ShareButtons.tsx`
- Reusable component with buttons for: Facebook, Twitter/X, WhatsApp, LinkedIn, Copy Link, Email
- Uses `navigator.share()` for mobile, falls back to URL-based share links
- Accepts `title`, `description`, `url` props

**Integration:** Add to all listing detail modals (PropertyPage, StaysPage, VehiclesPage, EventsPage) and SocialPage posts.

---

## 4. Comparison Tool (Properties & Stays)

**New file:** `src/components/ComparisonTool.tsx`
- Floating "Compare" bar that appears when items are added
- Side-by-side table comparing key metrics:
  - Properties: price, beds, baths, area, location, type, amenities
  - Stays: price/night, rating, rooms, stars, amenities, location
- Max 3 items, clear all button

**Context update:** `src/context/AppContext.tsx`
- Add `compareItems` state and `addToCompare`/`removeFromCompare`/`clearCompare` functions

**Integration:** Add "Compare" button to PropertyPage and StaysPage listing cards. Render `ComparisonTool` in those pages.

---

## 5. Replace Emoji Images with Real Photos (Unsplash URLs)

Currently all listings use emoji characters (🏨, 🚗, 🏡) as images. Replace with real photo URLs from Unsplash for a professional UX.

**File:** `src/data/pearl-hub-data.ts`
- Replace `image: "🏨"` with actual Unsplash photo URLs for all stays, vehicles, properties, and events
- Example: Shangri-La → `"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"` (luxury hotel)

**File updates across all pages** (PropertyPage, StaysPage, VehiclesPage, EventsPage, HomePage):
- Replace emoji rendering (`<div className="text-6xl">{item.image}</div>`) with `<img>` tags
- Add fallback to emoji if URL fails to load
- Update `MapMarker` type to handle both emoji and URL images
- Update `RecentlyViewed` rendering on HomePage

---

## 6. Email Notifications for New Enquiries

**New edge function:** `supabase/functions/notify-inquiry/index.ts`
- Triggered when a new inquiry is inserted
- Sends email notification to the listing owner (if owner_id is set and has a profile with email)
- Uses Lovable AI for simple notification — or we create a database trigger + edge function webhook

**Alternative simpler approach:** Add a database trigger that calls `pg_net` to invoke the edge function on new inquiry insert. The edge function looks up the owner's email from profiles and sends a notification.

Since email infrastructure requires domain setup, we'll implement the edge function and wire it up. If no email domain is configured, we'll note that to the user.

---

## 7. Platform-Wide UX Improvements

**Footer social links** (`src/components/Footer.tsx`):
- Replace generic emoji social buttons with proper links to Facebook, Instagram, Twitter, YouTube, LinkedIn with correct URLs

**SocialPage sharing** (`src/pages/SocialPage.tsx`):
- Replace the basic share button with the new `ShareButtons` component

**Missing features check:**
- Add "customer" to ForBusinessPage nav items in dashboard for stay_provider and event_organizer roles
- Add stay_provider and event_organizer to dashboard navItems

---

## File Change Summary

| Action | File |
|--------|------|
| Create | `src/components/ReviewSection.tsx` |
| Create | `src/components/ShareButtons.tsx` |
| Create | `src/components/ComparisonTool.tsx` |
| Create | `supabase/functions/notify-inquiry/index.ts` |
| Create | DB migration for `reviews` table |
| Edit | `src/data/pearl-hub-data.ts` — real photo URLs |
| Edit | `src/context/AppContext.tsx` — comparison state |
| Edit | `src/pages/PropertyPage.tsx` — wanted for all, compare, share, photos |
| Edit | `src/pages/StaysPage.tsx` — reviews, compare, share, photos |
| Edit | `src/pages/VehiclesPage.tsx` — reviews, share, photos |
| Edit | `src/pages/EventsPage.tsx` — reviews, share, photos |
| Edit | `src/pages/HomePage.tsx` — photo rendering |
| Edit | `src/pages/SocialPage.tsx` — share buttons |
| Edit | `src/components/Footer.tsx` — real social links |
| Edit | `src/pages/DashboardPage.tsx` — stay_provider/event_organizer nav |
| Edit | `src/types/pearl-hub.ts` — image type update |

