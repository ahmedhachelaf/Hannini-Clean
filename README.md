# Henini MVP

Henini (هنيني) is a bilingual home-services marketplace MVP for Algeria, built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

The current launch shape is intentionally narrow:

- Arabic first, French second
- one wilaya at launch: Oran
- curated marketplace, not instant dispatch
- provider-set pricing
- no in-app payment
- booking confirmation handed off to WhatsApp

## What is included

- Homepage with search, categories, zone filter, featured providers, and provider CTA
- Provider directory with category, zone, search, and ranking/sort controls
- Provider profile pages with rates, availability, gallery placeholders, WhatsApp, and Google Maps
- Booking flow that stores to Supabase and prepares a WhatsApp confirmation link
- Provider signup flow for manual approval
- Booking-linked review flow
- Basic protected admin area for moderation and metadata
- Arabic and French UI dictionaries with Arabic as the default route
- Seed data for Oran across core service categories

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy the env template and fill in your values:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open:

- [http://localhost:3000/ar](http://localhost:3000/ar)
- admin login: [http://localhost:3000/ar/admin/login](http://localhost:3000/ar/admin/login)

If Supabase environment variables are missing, the app still renders with local seed data and mutation routes fall back to demo mode. That is useful for UI work, but real persistence requires Supabase.

## Environment variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_ACCESS_PASSWORD=your-admin-password
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is used only on the server for MVP writes and admin actions.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is included for future browser-side Supabase usage, even though the current MVP keeps writes on the server.

## Supabase setup

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run [`supabase/schema.sql`](/Users/ahmedhachelaf/Desktop/archive%202/demarches%20mac/my%20website/supabase/schema.sql).
4. Run [`supabase/seed.sql`](/Users/ahmedhachelaf/Desktop/archive%202/demarches%20mac/my%20website/supabase/seed.sql).
5. Add the environment variables locally and in Vercel.

## Tables created

The schema includes:

- `users`
- `providers`
- `provider_services`
- `service_areas`
- `availability`
- `bookings`
- `reviews`
- `provider_verifications`
- `provider_photos`
- `categories`
- `zones`

## How the data layer works

- Public pages read approved providers only.
- The default ranking blends rating, completed jobs, response speed, and verified status.
- Bookings save the requested date/time, address, Maps link, and preferred contact method.
- Reviews are tied to a booking and update provider rating aggregates.
- Provider applications are created as `pending` until an admin approves them.

## Deployment to Vercel

1. Push the repo to GitHub.
2. Import the project into Vercel as a Next.js app.
3. Add the same environment variables from `.env.local`.
4. Deploy.

Recommended post-deploy checks:

- visit `/ar` and `/fr`
- test provider filtering
- submit a booking and confirm the WhatsApp link opens correctly
- submit a provider application
- sign in to `/ar/admin/login` and review moderation actions

## MVP notes

- File uploads in provider signup are captured as filenames for manual review in this MVP. If you want real media uploads next, the clean extension point is Supabase Storage.
- Payments are intentionally out of scope for this version.
- English is intentionally not implemented yet, to keep launch focus on Arabic and French.
