# CURSOR ENGINEERING DIRECTIVE — AURA Full Application

You are a senior frontend engineer. This is a COMPLETE single-page application, not just auth screens. Build every page listed below. Do NOT stop after login/register.

---

## ⚠️ CRITICAL: COLOR SYSTEM — NON-NEGOTIABLE

**The entire app MUST use this dark theme. White backgrounds are FORBIDDEN.**

Create `src/index.css` with these exact values FIRST before writing any component:

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --navy:        #0A0E1A;
  --navy-card:   #111827;
  --navy-raised: #1A2332;
  --navy-border: #1E2D42;
  --cyan:        #00D4FF;
  --cyan-hover:  #00B8DC;
  --cyan-dim:    rgba(0, 212, 255, 0.10);
  --cyan-glow:   rgba(0, 212, 255, 0.25);
  --text-1:      #FFFFFF;
  --text-2:      #8B9AB4;
  --text-3:      #4A5568;
  --success:     #10B981;
  --error:       #EF4444;
  --warning:     #F59E0B;
  --r-sm:        8px;
  --r-md:        12px;
  --r-lg:        16px;
  --r-xl:        24px;
}

body {
  background: var(--navy);
  color: var(--text-1);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}
```

Import Inter and Space Grotesk from Google Fonts in `index.html`:
```html

```

**ENFORCEMENT RULES — CHECK EVERY COMPONENT:**
- `background: white` → REPLACE with `var(--navy-card)`
- `color: black` or `color: #333` → REPLACE with `var(--text-1)`
- `border: 1px solid #ccc` → REPLACE with `1px solid var(--navy-border)`
- Any light gray background → REPLACE with `var(--navy-raised)`
- Blue accent (#007bff etc.) → REPLACE with `var(--cyan)`
- Button primary → `background: var(--cyan); color: var(--navy); font-weight: 600`
- Input fields → `background: rgba(255,255,255,0.05); border: 1px solid var(--navy-border); color: var(--text-1)`
- Input focus → `border-color: var(--cyan); outline: none; box-shadow: 0 0 0 3px var(--cyan-dim)`

---

## Tech Stack

- React 18 + TypeScript (strict)
- Vite 5
- React Router v6
- Zustand 4 (persist middleware)
- React Hook Form + Zod
- Framer Motion
- Lucide React icons
- Leaflet + React-Leaflet (for map)
- Tailwind CSS — but CSS variables above take priority for colors

---

## Application Pages (BUILD ALL OF THESE)

### Route Map:
```
/login          → LoginPage
/register       → RegisterPage
/dashboard      → DashboardPage    ← main home after login
/map            → MapPage          ← accessibility map
/report         → ReportPage       ← submit a barrier report
/profile        → ProfilePage      ← user profile + settings
```

All routes except /login and /register are protected (redirect to /login if not authenticated).

---

## Mock Data & Store

### `src/stores/authStore.ts`
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  mobilityProfile: 'wheelchair' | 'visual' | 'respiratory' | 'stroller' | 'standard';
  reportsSubmitted: number;
  joinedAt: string;
}

// Mock login: any email + password >= 8 chars succeeds
// Simulate 1000ms delay
// Store user in localStorage via Zustand persist
```

### `src/stores/mapStore.ts`
```typescript
// 15 hardcoded mock barrier reports around Baku (lat/lng near 40.4093, 49.8671)
interface BarrierReport {
  id: string;
  lat: number;
  lng: number;
  type: 'broken_ramp' | 'high_curb' | 'closed_elevator' | 'poor_surface' | 'no_ramp';
  severity: 'low' | 'medium' | 'high';
  address: string;
  description: string;
  reportedBy: string;
  votes: number;
  imageUrl: string; // use https://picsum.photos/300/200?random=N
  createdAt: string;
  inclusivityScore: number; // 0-100
}

// Also store user-submitted reports
// Also store: activeProfile (mirrors user mobilityProfile)
```

### `src/stores/routeStore.ts`
```typescript
// Mock route calculation
interface RouteOptions {
  from: string;
  to: string;
  profile: string;
}
interface CalculatedRoute {
  distance: string;
  duration: string;
  inclusivityIndex: number; // I = (Accessibility × AirQuality) / Barriers
  accessibilityScore: number;
  airQualityIndex: number;
  barrierCount: number;
  waypoints: [number, number][];
  warnings: string[];
}
// Simulate 1500ms calculation delay
```

---

## Layout & Navigation

### `src/components/layout/AppShell.tsx`
Persistent layout for all authenticated pages:

**Top Navbar** (60px height, `background: var(--navy-card)`, `border-bottom: 1px solid var(--navy-border)`):
- Left: AURA logo (shield SVG icon in cyan + "AURA" in Space Grotesk 700)
- Right: notification bell icon + user avatar circle (initials, cyan bg)

**Bottom Tab Bar** (mobile-first, 64px, `background: var(--navy-card)`, `border-top: 1px solid var(--navy-border)`):
- 4 tabs: Home (LayoutDashboard icon) | Map (Map icon) | Report (Plus icon) | Profile (User icon)
- Active tab: icon + label in `var(--cyan)`, inactive: `var(--text-3)`
- Active indicator: 2px top border in cyan on active tab

---

## Page Specifications

### LOGIN PAGE (`/login`)

Full screen `background: var(--navy)` with subtle circuit SVG pattern (opacity 0.04, stroke var(--cyan)).

Centered card (max-width 420px):
- `background: var(--navy-card)`
- `border: 1px solid var(--navy-border)`
- `border-radius: var(--r-xl)`
- padding: 40px

Content:
1. AURA logo + tagline "Hər kəs üçün əlçatan, hər kəs üçün yaşıl"
2. "Xoş gəldiniz" h1 (28px, white, Space Grotesk)
3. Email input with Mail icon (left-padded)
4. Password input with eye toggle (PasswordInput component)
5. "Şifrəmi unutdum?" right-aligned (var(--cyan), 13px)
6. Submit: full-width button, `background: var(--cyan)`, `color: var(--navy)`, 48px height, spinner on loading
7. Divider "və ya" with horizontal lines (border color: var(--navy-border))
8. "Hesabınız yoxdur? Qeydiyyatdan keçin" link to /register

### REGISTER PAGE (`/register`)

Same card style. Scrollable if needed.

Content:
1. AURA logo
2. "Hesab yaradın" heading
3. Full name input (User icon)
4. Email input (Mail icon)
5. Password + strength bar (4 levels, colored: red/orange/yellow/green)
6. Confirm password input
7. **Mobility Profile Selector** — REQUIRED, grid 2 cols:
   Each option is a selectable card:
   `background: var(--navy-raised); border: 1px solid var(--navy-border); border-radius: var(--r-md); padding: 16px; cursor: pointer`
   SELECTED state: `border-color: var(--cyan); background: var(--cyan-dim)`
   Options: ♿ Əlil arabası | 👁 Görmə məhdudiyyəti | 🫁 Tənəffüs xəstəliyi | 🍼 Uşaq arabası | 🚶 Standart
8. Terms checkbox
9. Submit button (same cyan style)
10. Login link

### DASHBOARD PAGE (`/dashboard`)

After login, this is the home screen. Full dark navy layout.

**Section 1 — Welcome Banner**
```
background: linear-gradient(135deg, var(--navy-card) 0%, var(--navy-raised) 100%)
border: 1px solid var(--navy-border)
border-left: 3px solid var(--cyan)
padding: 24px
border-radius: var(--r-lg)
```
Content: "Salam, {name}!" (24px) + mobility profile badge (cyan outline pill) + today's date

**Section 2 — Stats Row** (3 cards, flex/grid):
Each stat card: `background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: var(--r-md); padding: 20px`
- Card 1: Shield icon (cyan) | "Ətrafınızdakı maneələr" | **{count}** (32px, cyan)
- Card 2: Wind icon | "Hava keyfiyyəti" | **Orta** (AQI badge colored amber)
- Card 3: Route icon | "Bu gün marşrut" | **{n} km** 

**Section 3 — Quick Route Planner**
Card with title "Marşrut Hesabla":
- "Haradan:" input with MapPin icon
- "Haraya:" input with MapPin icon
- "Hesabla" button (cyan)
- On submit → show mock CalculatedRoute result inline:
  - Inclusivity Index badge (large, cyan glow)
  - Distance + Duration
  - Warning chips if barriers exist
  - "Xəritədə Gör" button → navigate to /map

**Section 4 — Recent Reports Feed** (last 5 from mapStore)
Title: "Son Bildirilən Maneələr"
Each item: horizontal card with severity dot + address + type badge + vote count + timestamp

**Section 5 — Air Quality Strip**
Full-width bar: `background: var(--navy-raised)` with colored AQI segments (Good=green, Moderate=amber, Poor=red). Show current Baku AQI (mock: 72, Orta).

### MAP PAGE (`/map`)

Full-height map (subtract navbar + tabbar heights).

**Leaflet map config:**
- Tile: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` (dark tiles to match app theme)
- Center: [40.4093, 49.8671] (Baku), zoom 13
- Attribution: CartoDB

**Custom markers by severity:**
- high → red circle marker with white "!" 
- medium → amber circle marker
- low → green circle marker

On marker click → bottom sheet slides up (Framer Motion):
- Image (picsum), address, type, severity badge, inclusivity score bar, vote button, "Marşruta əlavə et" button

**Filter chips above map** (floating, `background: var(--navy-card)`, blur backdrop):
All | Sınıq Pандус | Yüksək Səki | Qapalı Lift | Pis Səth

**FAB button** (bottom right, 56px circle, `background: var(--cyan)`, plus icon in navy):
→ navigates to /report

### REPORT PAGE (`/report`)

Form page for submitting a new barrier.

Card layout, full dark styling.

Fields:
1. **Maneə Növü** — segmented control (5 types, cyan active state)
2. **Ciddilik Dərəcəsi** — 3-option pill selector (Aşağı/Orta/Yüksək) with color coding
3. **Ünvan** — text input with MapPin icon + "Mənim Yerimi İstifadə Et" button (gets mock coords)
4. **Şəkil əlavə et** — drag-drop zone:
   `border: 2px dashed var(--navy-border); background: var(--navy-raised); border-radius: var(--r-lg); padding: 40px; text-align: center`
   Hover: `border-color: var(--cyan); background: var(--cyan-dim)`
   Shows image preview after selection
5. **Təsvir** — textarea (same dark input style)
6. Submit button: "Bildir" (cyan, full width, 48px)
7. On submit → success state:
   - Animated checkmark (Framer Motion draw animation, cyan stroke)
   - "Maneə bildirildi! Təşəkkür edirik."
   - Inclusivity Index calculated for submitted area
   - "Xəritəyə Bax" button

### PROFILE PAGE (`/profile`)

**User card** (top):
`background: var(--navy-card); border: 1px solid var(--navy-border); border-radius: var(--r-lg); padding: 24px`
- Large avatar circle (64px, initials, cyan gradient bg)
- Name (20px, bold), email (14px, var(--text-2))
- Mobility profile badge (cyan outline)
- Edit button (pencil icon, outline style)

**Stats section:**
- Reports submitted: {n}
- Member since: {date}
- Inclusivity contributions: {n} votes

**Settings section** (list items with toggle switches):
```
background: var(--navy-raised); border-radius: var(--r-md); overflow: hidden
```
Each row: `border-bottom: 1px solid var(--navy-border); padding: 16px 20px; display: flex; justify-content: space-between`
- 🔔 Bildirişlər (toggle, cyan when on)
- 📍 Lokasiya icazəsi (toggle)
- 🌐 Dil: Azərbaycan (chevron right)
- 🔒 Məxfilik (chevron right)

**Danger zone:**
`border: 1px solid rgba(239,68,68,0.3); border-radius: var(--r-md); padding: 16px`
"Çıxış" button → logs out + redirect to /login

---

## Animations (Framer Motion)

```typescript
// Page transition wrapper — wrap every page:


// Tab switch: slide direction based on tab index
// Bottom sheet: y: "100%" → y: 0, spring physics
// Stat cards: stagger 0.08s delay each
// Success checkmark: pathLength 0 → 1 draw animation
// Marker pulse: scale 1 → 1.2 → 1 loop for high severity
```

---

## Final Checklist (Do NOT ship without these)

- [ ] ZERO white or light backgrounds anywhere in the app
- [ ] Every page uses dark navy color system defined in tokens
- [ ] Leaflet map uses dark CartoDB tiles (NOT default OSM tiles)
- [ ] All 6 routes exist and are navigable
- [ ] Bottom tab bar is present on all authenticated pages
- [ ] Mock data has 15 barrier reports seeded around Baku
- [ ] Route planner shows result with Inclusivity Index
- [ ] Report form has working image preview
- [ ] Profile page shows real user data from auth store
- [ ] Logout works and clears state
- [ ] Mobile responsive: tested at 375px width
- [ ] Framer Motion AnimatePresence wraps router for transitions
- [ ] TypeScript strict — no `any`

---

Start order:
1. `src/index.css` (tokens)
2. `src/stores/` (all 3 stores)  
3. `src/components/layout/AppShell.tsx`
4. Auth pages (LoginPage, RegisterPage)
5. DashboardPage
6. MapPage
7. ReportPage
8. ProfilePage
9. Wire up Router in App.tsx