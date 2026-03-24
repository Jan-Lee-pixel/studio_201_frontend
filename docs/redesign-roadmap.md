# Studio 201 Redesign Roadmap

This document turns the homepage concept in [clean-modern-gallery-home.html](/home/leem/program-files/studio_201/frontend/docs/clean-modern-gallery-home.html) into a whole-site redesign plan for the public website, artist portal, and admin portal.

The goal is to redesign the product without breaking the workflows that are already implemented.

## 1. North Star

Studio 201 should feel like one product with three modes:

- `Public`: editorial, exhibition-first, image-led
- `Artist`: calm workspace for profile, portfolio, and submission management
- `Admin`: efficient curation console for review, publishing, and operational control

The design system should be shared, but the shells should not be identical.

## 2. Hard Constraints

These constraints define the redesign:

- Preserve existing route structure and core flows
- Do not rewrite backend contracts unless a clear bug forces it
- Separate visual refactor from logic refactor where possible
- Keep public pages fast and cache-friendly for Cloudflare deployment
- Keep artist/admin functionality dynamic only where needed
- Do not turn the admin or artist portals into decorative marketing pages

## 3. Existing Product Surfaces

Current route groups:

- `frontend/src/app/(public)`
- `frontend/src/app/(artist)`
- `frontend/src/app/(admin)`

Current shell/style split:

- Public styling primarily in [globals.css](/home/leem/program-files/studio_201/frontend/src/styles/globals.css)
- Admin and artist dashboard styling primarily in [dashboard.css](/home/leem/program-files/studio_201/frontend/src/styles/dashboard.css)
- Public homepage in [page.tsx](/home/leem/program-files/studio_201/frontend/src/app/(public)/page.tsx)
- Admin shell in [layout.tsx](/home/leem/program-files/studio_201/frontend/src/app/(admin)/layout.tsx)
- Artist shell in [layout.tsx](/home/leem/program-files/studio_201/frontend/src/app/(artist)/layout.tsx)

Current product truth from [WHOAMI.md](/home/leem/program-files/studio_201/frontend/WHOAMI.md):

- exhibition-first design
- curated approval workflow
- minimal institutional aesthetic

The redesign should reinforce those three ideas rather than replace them.

## 4. What Must Not Break

The following features should be treated as locked behavior during the redesign:

- public exhibition, artist, archive, event, merch, and login flows
- artist auth and role-based redirects
- artist profile save flow
- artist profile image upload to Supabase storage
- artist portfolio and submission workflows
- artist merch/backroom submission flow
- admin review and status update flows
- admin exhibition creation and editing
- admin artist/event/merch management
- existing API and auth integrations

Rule:

- Change presentation first
- Change information architecture second
- Change service/data logic only when necessary

## 5. Design Direction

### 5.1 Shared Brand Language

Across all three modes:

- warm, paper-like neutrals
- restrained accent usage
- editorial serif for titles
- clean sans for UI and forms
- mono for labels, status, and metadata
- visible borders and sections instead of heavy shadows everywhere
- quiet, deliberate motion

### 5.2 Mode Differences

Public:

- large image fields
- stronger whitespace
- fewer panels
- narrative page openings
- visit and archive credibility

Artist:

- supportive workspace tone
- clear task grouping
- obvious save state and completion cues
- stronger preview-to-public relationship

Admin:

- denser layout
- better tables and filter bars
- status-first scanning
- compact cards only where they speed decisions

## 6. Target Design System

Build one shared UI foundation before migrating pages.

### 6.1 Tokens

Create one token layer for:

- color
- typography
- spacing
- radius
- border
- elevation
- motion
- status tones

Recommended outcome:

- keep the public palette direction from [globals.css](/home/leem/program-files/studio_201/frontend/src/styles/globals.css)
- merge the useful dashboard tones from [dashboard.css](/home/leem/program-files/studio_201/frontend/src/styles/dashboard.css)
- remove duplicate token definitions where possible

### 6.2 Shared Primitives

Create or standardize:

- buttons
- links
- inputs
- textareas
- selects
- checkboxes/radios
- pills and badges
- form sections
- field hints/errors
- cards
- tables
- drawers/panels
- empty states
- skeletons
- page headers
- filter bars
- confirmation modals
- sticky action bars

### 6.3 Shared Patterns

Standardize these patterns across artist/admin:

- page title + supporting description + primary action
- filter row
- table/list states
- status chip styling
- save feedback
- upload state
- destructive action confirmation
- mobile stacking rules

## 7. Site Architecture By Mode

### 7.1 Public Website

Primary job:

- communicate what is on view
- introduce artists and archive
- provide reasons to visit

Target public route order:

1. homepage
2. exhibitions index
3. exhibition detail
4. artists index
5. artist detail
6. archive
7. events
8. merch / editions / spaces
9. login / pending / auth completion

Key structural changes:

- replace repetitive empty states with fewer curated content blocks
- add a proper `Visit` block to public surfaces
- unify section rhythm and typography across public pages
- strengthen archive as an institutional proof layer
- make footer links real and purposeful

### 7.2 Artist Portal

Primary job:

- help artists maintain a public identity and submit work for Studio 201 review

Artist route priorities:

1. `artist/profile`
2. `artist/dashboard`
3. `artist/artworks`
4. `artist/artworks/manage`
5. `artist/backroom`
6. `artist/messages`

Key structural changes:

- use one consistent workspace shell
- add clearer page intros and task grouping
- make public profile readiness more visible
- separate `public portfolio` and `review submissions` more clearly
- add stronger save/dirty/last-updated cues
- make upload and submit flows feel safer and less fragile

### 7.3 Admin Portal

Primary job:

- help curators review, publish, and manage quickly

Admin route priorities:

1. `admin/submissions`
2. `admin/exhibitions`
3. `admin/exhibitions/new`
4. `admin/exhibitions/[id]`
5. `admin/artists`
6. `admin/page`
7. `admin/events`
8. `admin/merch`
9. `admin/editions`
10. `admin/settings`
11. `admin/analytics`

Key structural changes:

- reduce hero-card noise on operational pages
- move to denser, more legible management layouts
- make status and filters more prominent
- use tables when review speed matters more than visual flourish
- keep card views only for artwork review and image-heavy curation

## 8. Route-Level Redesign Notes

### Public

`/`

- keep current exhibition as the lead
- replace multiple empty-state sections with a curated program block
- add visit/contact block before footer

`/exhibitions`

- maintain editorial lead
- improve filters or chronology only if it helps scanning

`/exhibitions/[slug]`

- strengthen hierarchy: title, dates, curatorial note, participating artists, works, visit cue

`/artists`

- use a stronger roster layout with more context than names only

`/artists/[slug]`

- show bio, statement, selected works, exhibitions, and social/contact in a cleaner hierarchy

`/archive`

- prioritize chronology and filtering over decoration

`/events`

- differentiate event types more clearly
- avoid showing event emptiness as a major page feature

`/merch`, `/editions`, `/spaces`

- preserve inquiry-first tone
- use the same editorial system rather than a separate visual language

### Artist

`/artist/profile`

- redesign first
- use grouped sections: identity, public biography, links, profile image, advanced slug controls
- add sticky save bar and preview/public link treatment

`/artist/dashboard`

- simplify to orient the next action
- retain stats, readiness, recent submissions, and composer panels

`/artist/artworks`

- make the split between public works and submissions explicit
- improve list scanning and status visibility

`/artist/artworks/manage`

- keep media upload and metadata editing stable
- improve form grouping and action placement

`/artist/backroom`

- keep submission workflow intact
- improve item states and review visibility

`/artist/messages`

- low priority until messaging is real
- keep as a placeholder but align with the new shell

### Admin

`/admin/submissions`

- redesign first
- likely keep card-based pending review + table-based reviewed items
- add stronger filter bar and more visible action confirmation

`/admin/exhibitions`

- convert to cleaner management table/list hybrid

`/admin/exhibitions/new` and `/admin/exhibitions/[id]`

- use one exhibition editor pattern
- break forms into logical editorial sections

`/admin/artists`

- emphasize access state, review state, artist ranking, and quick actions

`/admin/page`

- turn current card grid into a more useful dashboard: pending queue, current exhibitions, recent changes, urgent actions

`/admin/events`, `/admin/merch`, `/admin/editions`, `/admin/settings`

- align to the same management patterns and shared form system

## 9. Functionality Preservation Strategy

This redesign should be executed as a UI migration, not a product rewrite.

### 9.1 Keep Existing Route Contracts

Do not change route URLs during the first redesign pass.

### 9.2 Keep Existing Services

Preserve existing service layers such as:

- [publicApi.ts](/home/leem/program-files/studio_201/frontend/src/lib/publicApi.ts)
- auth services
- exhibition services
- event services
- artist services
- submission services
- merch services

### 9.3 Use Adapter Components

Where necessary:

- keep current data fetching
- wrap data in new presentation components
- move old page sections behind new shells gradually

### 9.4 Avoid Simultaneous Logic + Design Rewrites

Bad:

- redesign a page while changing its API shape, form behavior, and auth gate

Good:

- preserve the data flow
- replace layout, component hierarchy, and styling

## 10. Cloudflare Free Tier Guardrails

This project is already designed for Cloudflare / OpenNext:

- [open-next.config.ts](/home/leem/program-files/studio_201/frontend/open-next.config.ts)
- public pages use `revalidate` in [publicApi.ts](/home/leem/program-files/studio_201/frontend/src/lib/publicApi.ts)
- artist/admin routes use `force-dynamic`, which is appropriate for authenticated workspaces

### 10.1 What Matters On Free Tier

Current official references:

- Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Pages Functions pricing: https://developers.cloudflare.com/pages/functions/pricing/
- OpenNext caching: https://opennext.js.org/cloudflare/caching

Implications for Studio 201:

- keep public pages cacheable
- keep dynamic work concentrated in low-traffic authenticated routes
- avoid unnecessary server invocations for static assets
- avoid high-frequency polling and overly chatty dashboards
- keep page payloads lean, especially image-heavy pages

### 10.2 Public Optimization Rules

- prefer server-rendered public pages with `revalidate`
- keep public listing/detail pages mostly static between revalidations
- self-host or cache fonts/assets wisely
- compress and size images before upload
- avoid making public pages client-heavy without a strong reason
- treat empty states as content-light, not component-heavy

### 10.3 Artist/Admin Optimization Rules

- keep authenticated routes dynamic, but reduce repeated data fetches
- avoid loading large modules on first render when not needed
- lazy-load non-critical editors, charts, or media tooling
- use pagination and filters for long tables instead of huge initial loads
- minimize cross-page duplicate fetches

### 10.4 Image and Media Rules

- upload appropriately sized images
- define target aspect ratios by context
- avoid runtime transformations that add Worker cost unless necessary
- use lazy loading for below-the-fold image grids

### 10.5 Caching Recommendations

- keep `/_next/static/*` as cache-friendly static assets
- use route revalidation for public collections and details
- do not force dynamic rendering on public routes unless the content truly requires it
- revisit OpenNext cache configuration only after public route migration is stable

## 11. Implementation Phases

### Phase 1: Shared System Foundation

Deliverables:

- token consolidation
- shared component primitives
- page header, filter bar, table, form, modal, status system
- typography and spacing rules

Likely file areas:

- `src/styles`
- `src/components/ui`
- `src/components/layout`
- `src/components/animation`

Success criteria:

- public, artist, and admin can all consume the same basic primitives

### Phase 2: Public Site Migration

Deliverables:

- homepage redesign implemented
- exhibitions index/detail aligned to the new system
- artists index/detail aligned
- archive/events aligned
- merch/editions/spaces aligned
- visit/contact layer added

Success criteria:

- public site feels like one coherent gallery experience
- no public routes lose content or navigation

### Phase 3: Artist Workspace Migration

Deliverables:

- updated artist shell
- redesigned profile page
- redesigned dashboard and artworks pages
- manage artwork and backroom aligned to the new form system

Success criteria:

- artists can still save, upload, submit, and preview without regressions

### Phase 4: Admin Curation Console Migration

Deliverables:

- updated admin shell
- submissions queue redesign
- exhibitions manager/editor redesign
- artists/events/merch/settings alignment

Success criteria:

- admin review tasks are faster to scan and operate
- no approval/editing flow is lost

### Phase 5: Performance, QA, and Launch Hardening

Deliverables:

- responsive pass
- empty/loading/error state pass
- image optimization pass
- Cloudflare caching/config review
- regression test checklist completion

Success criteria:

- public site remains cache-friendly
- artist/admin remain functional and stable

## 12. Execution Order

Recommended sequence:

1. consolidate tokens and primitives
2. implement public homepage from the new concept
3. align public exhibition and artist detail pages
4. redesign artist profile
5. redesign admin submissions
6. migrate remaining artist routes
7. migrate remaining admin routes
8. run responsive, accessibility, and Cloudflare optimization pass

## 13. Acceptance Criteria

The redesign is complete when:

- all public routes share one coherent editorial system
- all artist routes share one coherent workspace system
- all admin routes share one coherent curation system
- no existing core flow is lost
- public pages remain cacheable and efficient on Cloudflare
- authenticated routes remain dynamic only where appropriate
- mobile layouts are usable across public, artist, and admin surfaces

## 14. Immediate Next Actions

Recommended next implementation steps:

1. Extract shared tokens from `globals.css` and `dashboard.css`
2. Build the new shared primitives library
3. Implement the public homepage redesign in `src/app/(public)/page.tsx`
4. Redesign `artist/profile` as the first workspace page
5. Redesign `admin/submissions` as the first curation page

## 15. Notes

- The homepage template is a direction, not a literal layout to paste everywhere
- Public, artist, and admin should look related, not identical
- The redesign should increase clarity and reduce noise before adding visual complexity
- Cloudflare optimization is mostly a rendering and caching discipline problem, not only a styling problem
