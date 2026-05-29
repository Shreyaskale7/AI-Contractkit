---
name: design-system-security
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Security — AI Contract Design System

## Design intent

Deliver a clean, enterprise-grade SaaS interface for AI Contract that prioritizes trust, clarity, and keyboard-first accessibility across authenticated dashboard surfaces.

---

## Context and goals

| Field | Value |
|---|---|
| Product | AI Contract (Security module) |
| URL | https://contracts.ai/security |
| Audience | Authenticated users and operators |
| Surface | Dashboard web app |
| Standard | WCAG 2.2 AA |

**Goals**
- Teams must ship UI using semantic tokens only — never raw hex in components.
- Every interactive component must define all seven states: default, hover, focus-visible, active, disabled, loading, error.
- Motion must reinforce hierarchy without blocking interaction or violating `prefers-reduced-motion`.
- Page density baseline: **34 buttons**, **20 links**, **16 cards**, **2 inputs**, **1 navigation** shell per typical dashboard view.

---

## Design tokens and foundations

### Typography

| Token | Value | Usage |
|---|---|---|
| `font.family.primary` | BDO Grotesk | Headings, UI labels |
| `font.family.stack` | BDO Grotesk, Arial, sans-serif | Body fallback |
| `font.size.base` | 14px | Body, inputs, nav items |
| `font.weight.base` | 300 | Default body weight |
| `font.lineHeight.base` | 21px | Body line height |
| `font.size.xs` | 14px | Captions, meta labels |
| `font.size.sm` | 56.02px | Display / hero headlines only |

**Typography rules**
- Body copy must use `font.size.base` + `font.lineHeight.base`.
- Display headlines must use `font.size.sm` on marketing surfaces only; dashboard H1 should use 36px (mapped to `font.size.xl` extension).
- Teams should not introduce one-off font sizes outside the token scale.

### Color (semantic)

| Token | Hex (foundations only) | Semantic role |
|---|---|---|
| `color.text.primary` | #2e363c | Primary body text on light surfaces |
| `color.text.secondary` | #15355c | Subheadings, nav inactive, metadata |
| `color.text.inverse` | #ffffff | Text on dark/strong surfaces |
| `color.text.on-strong` | #222222 | Text on `color.surface.strong` when contrast requires |
| `color.surface.base` | #000000 | Sidebar, dark chrome |
| `color.surface.muted` | #f2f9ff | Page canvas |
| `color.surface.raised` | #ffffff | Cards, modals, inputs |
| `color.surface.strong` | #0497f9 | Primary actions, active indicators |
| `color.border.default` | rgba(21,53,92,0.12) | Card and input borders |
| `color.border.subtle` | rgba(21,53,92,0.06) | Row dividers |
| `color.focus.ring` | #0497f9 | Focus-visible outline |
| `color.status.success` | #0d9488 | Signed, paid |
| `color.status.warning` | #d97706 | Sent, pending |
| `color.status.danger` | #dc2626 | Error, logout |
| `color.status.info` | #0497f9 | Informational badges |

**Contrast rules**
- Text on `color.surface.raised` must meet 4.5:1 (normal) or 3:1 (large text).
- Text on `color.surface.strong` must use `color.text.inverse` unless audit passes with `color.text.on-strong`.
- Focus rings must remain visible on all surface combinations (minimum 3:1 against adjacent colors).

### Spacing

| Token | Value |
|---|---|
| `space.1` | 6px |
| `space.2` | 18px |
| `space.3` | 24px |
| `space.4` | 48px |
| `space.5` | 72px |
| `space.6` | 96px |

**Layout**
- Card padding: `space.3`
- Section gaps: `space.3`–`space.4`
- Inline control gaps: `space.1`–`space.2`
- Sidebar width: 240px (fixed)

### Radius, shadow, motion

| Token | Value |
|---|---|
| `radius.xs` | 6px |
| `radius.sm` | 12px |
| `shadow.sm` | 0 1px 3px rgba(0,0,0,0.06) |
| `shadow.md` | 0 4px 16px rgba(4,151,249,0.08) |
| `shadow.lg` | 0 12px 40px rgba(0,0,0,0.10) |
| `motion.duration.instant` | 200ms |
| `motion.duration.fast` | 300ms |
| `motion.duration.normal` | 450ms |
| `motion.easing.default` | cubic-bezier(0.4, 0, 0.2, 1) |
| `motion.easing.enter` | cubic-bezier(0, 0, 0.2, 1) |
| `motion.easing.exit` | cubic-bezier(0.4, 0, 1, 1) |

**Motion principles**
- Hover/focus transitions must use `motion.duration.instant`.
- Page enter animations should use `motion.duration.fast` with `motion.easing.enter`.
- Staggered list reveals should cap at 60ms delay per item.
- Users with `prefers-reduced-motion: reduce` must receive instant state changes (no transform/opacity animation).

---

## Component-level rules

### Navigation (sidebar)

**Anatomy:** logo block, user block, nav list, footer actions (theme toggle, logout).

| State | Behavior |
|---|---|
| Default | `color.text.secondary` on `color.surface.base` |
| Hover | Background `rgba(4,151,249,0.08)`, text lightens |
| Focus-visible | 2px `color.focus.ring` outline, offset 2px |
| Active | Left border 3px `color.surface.strong`, bg `rgba(4,151,249,0.14)`, text `color.text.inverse` |
| Disabled | opacity 0.4, pointer-events none |
| Loading | Skeleton shimmer on nav items |
| Error | N/A for nav shell |

**Keyboard:** Arrow keys move between items; Enter/Space activates link; Tab order: logo → user → nav items → footer.
**Pointer:** Click target minimum 44×44px touch area via padding.
**Touch:** Active state scale 0.98 on tap; no hover-only affordances.
**Overflow:** Long labels must truncate with ellipsis; tooltip on focus for full text.
**Responsive:** Below 768px, sidebar collapses to icon rail (future); content margin adjusts.

### Button (34 instances typical)

**Variants:** primary (`color.surface.strong`), secondary (outlined), ghost (text only), danger.

| State | Primary |
|---|---|
| Default | bg `color.surface.strong`, text `color.text.inverse` |
| Hover | brightness +8%, `shadow.md` |
| Focus-visible | 2px ring `color.focus.ring`, offset 2px |
| Active | scale 0.98, brightness −5% |
| Disabled | opacity 0.5, cursor not-allowed |
| Loading | spinner replaces label, aria-busy true |
| Error | border `color.status.danger`, optional error text below |

**Spacing:** padding `space.1` vertical × `space.2` horizontal; radius `radius.sm`; font `font.size.base`, weight 500.
**Long content:** Label must truncate at 240px max; full label in aria-label when truncated.
**Empty state CTA:** Primary button centered, min-width 160px.

### Link (20 instances typical)

| State | Behavior |
|---|---|
| Default | `color.surface.strong`, underline-offset 3px |
| Hover | underline, opacity 0.85 |
| Focus-visible | outline 2px `color.focus.ring` |
| Active | opacity 0.7 |
| Disabled | opacity 0.4, no pointer events |
| Loading | Optional trailing spinner |
| Error | `color.status.danger` with error icon |

### Card (16 instances typical)

**Anatomy:** optional header, body, optional footer action.

| State | Behavior |
|---|---|
| Default | bg `color.surface.raised`, border `color.border.default`, `shadow.sm`, radius `radius.sm` |
| Hover | `shadow.md`, translateY −2px (if interactive) |
| Focus-visible | ring when card is clickable |
| Active | translateY 0 |
| Disabled | opacity 0.6 |
| Loading | Skeleton placeholders matching card layout |
| Error | border-left 4px `color.status.danger` |

**Overflow:** Table rows inside cards scroll vertically at max-height 480px; horizontal scroll on mobile.
**Empty state:** Icon + title + description + primary action; min-height 200px.

### Input (2+ instances typical)

**Anatomy:** label, input field, helper/error text.

| State | Behavior |
|---|---|
| Default | border `color.border.default`, bg `color.surface.raised` |
| Hover | border darkens slightly |
| Focus-visible | border `color.surface.strong`, ring 2px `color.focus.ring` |
| Active | same as focus |
| Disabled | bg `color.surface.muted`, cursor not-allowed |
| Loading | trailing spinner inside field |
| Error | border `color.status.danger`, error message below in danger color |

**Spacing:** label margin-bottom `space.1`; field padding `space.1` × `space.2`; radius `radius.xs`.
**Long content:** Input text scrolls horizontally; textarea wraps at `space.3` max-width.

---

## Accessibility requirements

### Testable acceptance criteria

| ID | Criterion | Pass | Fail |
|---|---|---|---|
| A1 | All interactive elements reachable via Tab | Focus moves logically through UI | Focus trap or skip |
| A2 | Focus indicator visible | 2px ring on every focused control | No visible focus or outline:none without replacement |
| A3 | Color contrast (body) | ≥ 4.5:1 for text under 18px | Below 4.5:1 |
| A4 | Color contrast (large) | ≥ 3:1 for text ≥ 18px bold or 24px | Below 3:1 |
| A5 | Buttons have accessible names | Visible text or aria-label | Icon-only without label |
| A6 | Loading state announced | aria-busy="true" on loading buttons | Silent loading with no indicator |
| A7 | Error state announced | aria-invalid + aria-describedby to error id | Error color only |
| A8 | Reduced motion | No animation when prefers-reduced-motion | Animations ignore preference |
| A9 | Touch targets | ≥ 44×44px effective area | Smaller without exception |
| A10 | Form labels | Every input has associated label | Placeholder-only labeling |

---

## Content and tone standards

**Tone:** Concise, confident, implementation-focused. Security-forward language where relevant.

| Do | Don't |
|---|---|
| "Generate contract" | "Go" |
| "View all contracts" | "Click here" |
| "Sign in to your account" | "Login" (ambiguous) |
| "Payment pending since 12 May" | "Pending!!!" |

**Examples**
- Page title: "Contract business overview"
- CTA: "Get started free"
- Error: "Email or password is incorrect. Try again or reset your password."
- Empty: "No recent contracts. Generate a contract to see activity here."

---

## Anti-patterns and prohibited implementations

- Do not use raw hex in component styles — map to CSS custom properties.
- Do not hide focus outlines without a visible replacement.
- Do not use purple/indigo gradients outside legacy migration window.
- Do not use emoji as sole iconography in production nav (use SVG icons in future pass).
- Do not animate layout-shifting properties (width, height) on main content.
- Do not ship hover-only tooltips without keyboard access.
- Do not use `font.size.sm` (56px) for dashboard body content.

### Migration notes

Replace legacy `--primary: #6366f1` with `--color-surface-strong: #0497f9`.
Replace `--cream-bg` with `--color-surface-muted: #f2f9ff`.
Replace `--sidebar-bg: #0f172a` with `--color-surface-base: #000000`.
Use class-based components (`.btn`, `.card`, `.input`) instead of inline styles for new work.

---

## QA checklist

- [ ] All colors reference semantic CSS variables
- [ ] Every button/link/input tested in 7 states
- [ ] Tab order verified on Dashboard, Login, Landing
- [ ] Focus ring visible on Chrome, Firefox, Safari
- [ ] Contrast checked with axe or Lighthouse (AA)
- [ ] `prefers-reduced-motion` disables page enter and card hover lift
- [ ] Empty states render with action CTA
- [ ] Long client/contract names truncate without layout break
- [ ] Mobile viewport 375px: no horizontal overflow on main content
- [ ] Loading skeletons match final layout dimensions

<!-- TYPEUI_SH_MANAGED_END -->
