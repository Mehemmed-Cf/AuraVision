# Cursor Engineering Directive: AURA — Auth Pages (Login & Register)

You are a senior frontend engineer. Build production-ready **Login** and **Register** pages for **AURA** — an AI-driven inclusive urban navigation app. No backend. Mock auth only.

---

## 1. Tech Stack (Non-Negotiable)

- React 18+ with TypeScript (strict mode)
- Vite 5+
- Tailwind CSS 3.4+ (utility-only, no component libraries)
- React Router v6 (client-side routing: `/login`, `/register`, `/dashboard`)
- Zustand 4+ for auth state (persist to localStorage)
- React Hook Form + Zod for form validation
- Framer Motion for page transitions and micro-interactions
- Lucide React for icons (24px default)
- No Bootstrap, MUI, Chakra, or any other CSS framework

---

## 2. AURA Design System

### Color Tokens (define in `src/styles/tokens.css`)

```css
:root {
  /* Primary palette */
  --aura-navy:        #0A0E1A;   /* main background */
  --aura-navy-card:   #111827;   /* card/surface background */
  --aura-navy-border: #1E2A3A;   /* card borders */
  --aura-cyan:        #00D4FF;   /* primary accent, CTA buttons */
  --aura-cyan-dim:    #0099BB;   /* cyan hover state */
  --aura-cyan-glow:   rgba(0, 212, 255, 0.12); /* subtle bg tints */

  /* Text */
  --aura-text-primary:   #FFFFFF;
  --aura-text-secondary: #8B9AB4;
  --aura-text-muted:     #4A5568;

  /* Semantic */
  --aura-success: #10B981;
  --aura-error:   #EF4444;
  --aura-warning: #F59E0B;

  /* Structural */
  --aura-radius-sm: 8px;
  --aura-radius-md: 12px;
  --aura-radius-lg: 16px;
  --aura-radius-xl: 24px;
}
```

### Typography Rules
- Font: `Inter` (Google Fonts) — weights 400, 500, 600 only
- Logo/brand text: `Space Grotesk` weight 700
- All labels: 13px, `--aura-text-secondary`
- Input text: 15px, `--aura-text-primary`
- Heading: 28px weight 600 on Auth pages
- Error messages: 12px, `--aura-error`

### Component Aesthetic
- Dark navy background (`--aura-navy`) full screen
- Auth card: `--aura-navy-card`, 1px border `--aura-navy-border`, radius-xl, padding 40px
- Card max-width: 440px, centered vertically and horizontally
- Subtle circuit-board SVG pattern in background (low opacity: 0.04)
- CTA buttons: solid `--aura-cyan` background, `--aura-navy` text, weight 600
- Input fields: `background: rgba(255,255,255,0.04)`, border `--aura-navy-border`, focus border `--aura-cyan`
- No box-shadows — use border color transitions for depth

---

## 3. File Structure

```
src/
├── components/
│   └── auth/
│       ├── AuthCard.tsx         # card shell with logo
│       ├── InputField.tsx       # reusable labeled input
│       ├── PasswordInput.tsx    # eye toggle variant
│       ├── SocialDivider.tsx    # "or continue with" divider
│       └── AuraLogo.tsx        # SVG logo + brand name
├── features/
│   └── auth/
│       ├── LoginPage.tsx
│       ├── RegisterPage.tsx
│       └── schemas.ts           # Zod validation schemas
├── stores/
│   └── authStore.ts             # Zustand mock auth store
├── routes/
│   └── ProtectedRoute.tsx       # redirects if not authenticated
├── styles/
│   └── tokens.css
└── App.tsx                      # router setup
```

---

## 4. Mock Auth Store (`src/stores/authStore.ts`)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: string;
  mobilityProfile: 'wheelchair' | 'visual' | 'respiratory' | 'stroller' | 'standard';
}

// Mock credentials accepted:
// email: demo@aura.az | password: Demo1234!
// Any new registration also succeeds and stores user in localStorage

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise;
  register: (name: string, email: string, password: string) => Promise;
  logout: () => void;
}
```

Simulate 1200ms network delay on login/register with a loading state.

---

## 5. Zod Schemas (`src/features/auth/schemas.ts`)

```typescript
// Login schema
const loginSchema = z.object({
  email: z.string().email('Düzgün e-poçt daxil edin'),
  password: z.string().min(8, 'Şifrə ən az 8 simvol olmalıdır'),
});

// Register schema
const registerSchema = z.object({
  name: z.string().min(2, 'Ad ən az 2 simvol olmalıdır').max(50),
  email: z.string().email('Düzgün e-poçt daxil edin'),
  password: z.string()
    .min(8, 'Şifrə ən az 8 simvol olmalıdır')
    .regex(/[A-Z]/, 'Ən az 1 böyük hərf lazımdır')
    .regex(/[0-9]/, 'Ən az 1 rəqəm lazımdır'),
  confirmPassword: z.string(),
  mobilityProfile: z.enum(['wheelchair','visual','respiratory','stroller','standard']),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Şərtləri qəbul etməlisiniz' }),
  }),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Şifrələr uyğun gəlmir',
  path: ['confirmPassword'],
});
```

---

## 6. Page Specifications

### Login Page (`/login`)

Layout (top to bottom inside AuthCard):
1. `AuraLogo` component (SVG shield icon + "AURA" in Space Grotesk)
2. Heading: "Xoş gəldiniz" + subtitle: "Hesabınıza daxil olun"
3. Email input with Mail icon
4. Password input with eye toggle
5. "Şifrəmi unutdum?" — right-aligned link (cyan, 13px)
6. Submit button — full width, "Daxil ol", loading spinner state
7. `SocialDivider` — "və ya"
8. Google SSO mock button — outlined style (NOT filled cyan)
9. Register link — "Hesabınız yoxdur? Qeydiyyatdan keçin"

Pre-fill the demo credentials as placeholder hint text only (NOT as defaultValues).

### Register Page (`/register`)

Layout:
1. `AuraLogo`
2. Heading: "Hesab yaradın" + subtitle: "AURA-ya qoşulun"
3. Full name input with User icon
4. Email input with Mail icon
5. Password input with strength indicator bar (4 levels: zəif / orta / güclü / çox güclü)
6. Confirm password input
7. **Mobility Profile Selector** — 5 cards in 2-column grid:
   - ♿ Əlil arabası
   - 👁 Görmə məhdudiyyəti
   - 🫁 Tənəffüs xəstəliyi
   - 🍼 Uşaq arabası
   - 🚶 Standart
   Each card: icon + label, border highlights cyan when selected
8. Terms checkbox — "Şərtləri və Məxfilik Siyasətini qəbul edirəm"
9. Submit button — "Qeydiyyatdan keç"
10. Login link — "Artıq hesabınız var? Daxil olun"

---

## 7. Animations (Framer Motion)

```typescript
// Page enter animation
const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

// Card mount
const cardVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.35 } },
};

// Stagger children (form fields)
const fieldVariants = {
  initial: { opacity: 0, x: -12 },
  animate: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
};
```

Also animate: error shake on failed login (translateX oscillation), success checkmark on register completion.

---

## 8. Background Circuit Pattern

Generate a repeating SVG `` with thin lines (opacity 0.04, stroke `--aura-cyan`) simulating a circuit board. Apply as CSS `background-image` on the root layout — NOT as a DOM element. Example pattern unit: horizontal + vertical lines with small circles at intersections. Size: 40x40 pattern tile.

---

## 9. Post-Auth Flow

After successful login → navigate to `/dashboard` with a welcome toast:
```typescript
// Simple toast (no library — implement with Framer Motion AnimatePresence)
// Top-right, 3s auto-dismiss
// "Xoş gəldiniz, {name}! AURA hazırdır." with cyan left border
```

After successful register → navigate to `/dashboard` with onboarding toast:
```
"Qeydiyyat tamamlandı! Marşrutunuzu fərdiləşdirək."
```

---

## 10. Quality Gates

Before marking complete:
- [ ] TypeScript strict — zero `any` types
- [ ] All inputs have `aria-label` and `aria-describedby` for error messages
- [ ] Tab order logical (name → email → password → submit)
- [ ] Mobile responsive: card full-width below 480px with 16px horizontal padding
- [ ] Loading state disables all inputs + shows spinner in button
- [ ] Error from store displays inline below form (not alert/console)
- [ ] `/dashboard` shows authenticated user's name and mobility profile badge
- [ ] Logout button on dashboard clears store + redirects to `/login`
- [ ] Framer Motion `AnimatePresence` wraps router outlet for page transitions
- [ ] Dark mode only (no light mode toggle needed — AURA is always dark)

---

Start with `src/styles/tokens.css` and `src/stores/authStore.ts`, then build components bottom-up before assembling pages.