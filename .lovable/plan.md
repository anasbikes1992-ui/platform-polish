

# Efficiency, Sales, and Platform Experience Improvements

## Bug Fix: "For Business" Footer Tabs Don't Open

**Problem:** The Footer's "For Business" links (Owner Listing, Broker Membership, Stay Providers, Event Organizers) all navigate to `/dashboard` without specifying which section to open or which role context to set. Users land on the generic overview with no relevant content shown.

**Fix:** Create a dedicated `/for-business` page that serves as a landing page for business users, with tabs for each business type (Owner, Broker, Stay Provider, Event Organizer, SME). Each tab shows relevant pricing, features, terms, and a CTA to sign up with that role. Footer links will navigate to `/for-business?tab=owner` etc. with query param routing.

---

## New Features for Better Sales and Platform Experience

### 1. For Business Landing Page (`/for-business`)
A dedicated page with tabs for each business role showing:
- Pricing cards with tier details (Owner listing fee, Broker membership, Stay provider commission, Event organizer commission, SME directory plans)
- Feature comparison table
- Role-specific terms and conditions inline
- "Get Started" CTA buttons that navigate to `/auth` with pre-selected role
- Testimonials/social proof section

### 2. Inquiry/Lead System
Add an inquiry form on each listing (Property, Stay, Vehicle, Event) so potential buyers/bookers can submit interest. This creates a lead pipeline for sellers:
- "Enquire Now" button on listing cards and detail modals
- Inquiry form captures name, email, phone, message
- Stores in a new `inquiries` database table
- Dashboard section "My Enquiries" for owners/brokers to view and respond
- Toast notification when inquiry is submitted

### 3. Wishlist/Comparison Feature
- Allow customers to save and compare up to 3 properties or stays side-by-side
- "Compare" button on listing cards, comparison modal with key metrics
- Leverages existing `favorites` system from AppContext

### 4. Quick Stats Banner on Service Pages
Add a trust/stats banner at the top of Property, Stays, Vehicles, Events pages showing live counts (e.g., "12,400 Properties | 890 Verified Owners | Rs. 3.9M Transacted") to build confidence.

### 5. Recently Viewed Section on Homepage
Track recently viewed listings in localStorage and show a "Continue Where You Left Off" section on the home page.

---

## Technical Implementation Plan

### Database Migration
```sql
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text NOT NULL,
  listing_type text NOT NULL, -- property, stay, vehicle, event
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  sender_phone text DEFAULT '',
  message text DEFAULT '',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'new', -- new, read, responded
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
-- Senders can insert, owners can read their own
```

### Files to Create
1. **`src/pages/ForBusinessPage.tsx`** — Tabbed business landing page with pricing, features, terms per role, and CTAs
2. Update **`src/components/Footer.tsx`** — Point "For Business" links to `/for-business?tab=...`
3. Update **`src/App.tsx`** — Add `/for-business` route

### Files to Modify
4. **`src/pages/DashboardPage.tsx`** — Add "Enquiries" nav item for owners/brokers, render inquiry list
5. **`src/pages/PropertyPage.tsx`** — Add "Enquire" button on listing detail modal
6. **`src/pages/StaysPage.tsx`** — Add "Enquire" button on booking modal
7. **`src/pages/VehiclesPage.tsx`** — Add "Enquire" button on booking modal  
8. **`src/pages/EventsPage.tsx`** — Add inquiry option
9. **`src/pages/HomePage.tsx`** — Add "Recently Viewed" section and quick stats banner
10. **`src/context/AppContext.tsx`** — Add `recentlyViewed` tracking

### Summary of Changes
- 1 new page (ForBusinessPage)
- 1 new database table (inquiries) with RLS
- Footer fix for business tabs
- Inquiry buttons across all 4 service pages
- Dashboard enquiries section for sellers
- Recently viewed on homepage
- Stats trust banners on service pages

