# Madrasa Management System — Design Brief

## Tone & Direction
Premium SaaS dashboard with Islamic geometric restraint. Bold, refined productivity interface inspired by Linear and Stripe. Clean visual hierarchy, purposeful spacing, sophisticated micro-interactions. Restraint is the signature — gold accents on key interactions, depth through elevation, motion that aids comprehension.

## Differentiation
Gold accent borders on interactive cards; sidebar gradient with active state highlight and inset ring; staggered card entrance animations; refined shadow hierarchy. Subtle Islamic geometric pattern at 3.5% opacity creates texture without distraction. Every hover state lifts with shadow expansion and refined color brightening.

## Color Palette
| Token | OKLCH | Purpose |
|-------|-------|---------|
| Primary | 0.32 0.09 155 | Deep Islamic green — primary buttons, interactive elements |
| Gold | 0.75 0.18 75 | Premium accent — key borders, hover highlights, shimmer line |
| Background | 0.97 0.005 145 | Light off-white — main content, pattern overlay |
| Card | 1 0 0 | Pure white — card surfaces, elevated elements |
| Sidebar | 0.22 0.07 155 | Dark green — navigation background, primary depth |
| Secondary | 0.93 0.03 155 | Light mint — subtle backgrounds, secondary states |
| Muted | 0.94 0.01 145 | Light gray — disabled, secondary text, dividers |
| Success | 0.55 0.15 145 | Green — positive states, fees paid |
| Warning | 0.75 0.18 75 | Gold — pending states, caution |

## Typography
**Display**: Plus Jakarta Sans (600 weight) — headers, titles, navigation  
**Body**: Plus Jakarta Sans (400–500) — content, labels, lists  
**Mono**: JetBrains Mono (400–700) — data, codes, tables

## Structural Zones
| Zone | Treatment | Depth |
|------|-----------|-------|
| Sidebar | Dark green gradient (0.22→0.19 L); active nav fills with accent + inset gold ring | Fixed left (768px+); drawer below |
| Top Bar | White with subtle bottom border; logo left, title center, profile right | Subtle elevation shadow |
| Main Content | Light off-white with Islamic pattern (3.5% opacity); card grid layout | Base elevation (pattern layer) |
| Cards | White with soft premium shadow; gold left border on interactive; staggered entrance animation | +12px shadow on hover, lifts 2px |
| Footer | Light muted (0.94 L) with top border | Subtle (0 1px 3px) shadow |

## Shadow Hierarchy
- **Soft**: 0 1px 3px (text dividers, subtle elements)
- **Card**: 0 2px 8px (default card, default state)
- **Premium-md**: 0 4px 12px (elevated cards, secondary depth)
- **Premium-lg**: 0 12px 24px (hover state, active focus, modals)

## Component Patterns
- **Buttons**: Gold/green BG; smooth color transition + 1px lift on hover; premium shadow
- **Cards**: White, soft shadow, gold left border; hover: -2px Y translate, shadow expands, border brightens
- **Tables**: Muted header row (soft shadow), alternating row subtle muted BG; hover highlights full row
- **Badges**: Semantic colors (success/warning) with low-alpha backgrounds (10–15%), rounded-full
- **Nav Links**: Sidebar items with background fill on active; text changes to gold on hover; active shows inset gold ring

## Motion & Micro-interactions
- **Transitions**: All interactive elements use 300ms ease-out curve by default
- **Card Entrance**: 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) bounce; staggered by 50ms per card
- **Hover**: Cards lift +2px, shadow expands to 0 12px 24px
- **Active States**: Sidebar items fill with accent color, inset ring adds depth
- **Gold Shimmer**: Pulsing animation (3s cycle) on accent lines
- **Page Load**: Cards fade in from top with staggered cascade

## Spacing & Rhythm
- **Gap**: Grid gaps 16px (gap-4)
- **Card Padding**: 24px (p-6)
- **Section Spacing**: 32px (space-y-8) between major sections
- **Button Padding**: 10px 16px (px-4 py-2)
- **Stagger**: 50ms delay between card animations

## Responsive Design
- **Mobile** (320px–767px): Full-width cards, sidebar collapses to drawer with overlay
- **Tablet** (768px–1023px): 2-column card grids, sidebar visible but compact
- **Desktop** (1024px+): 4-column card grids, full sidebar visible

## Constraints
- No full-page gradients; depth via layered surfaces and shadows only
- No rainbow palettes; stick to green + gold + neutral (3-color core)
- No generic Tailwind shadows; use premium hierarchy (soft/card/elevated/interactive)
- No arbitrary rounded corners; lg (8px) or 2xl (12px) only
- All animations must aid comprehension; no bouncy or gratuitous motion
- Entrance animations staggered 50–100ms per element for orchestrated cascade
- Islamic pattern kept at exactly 3.5% opacity to remain subtle texture
- Gold accents deployed sparingly: key borders, hover states, active indicators

## Signature Detail
Premium shadow hierarchy paired with refined motion choreography. Staggered card entrance animations create visual flow. Gold shimmer pulse on accent lines. Sidebar active state includes inset ring for depth. Islamic geometric pattern remains barely perceptible texture layer. Every interaction lifts slightly with shadow expansion — motion reinforces hierarchy without distraction.
