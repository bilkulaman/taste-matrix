# TasteMatrix Design System

This design system is extracted directly from the TasteMatrix E-Tongue landing page. It codifies the visual rules, dark aesthetics, and interactive components.

---

## 1. Color Tokens (`src/styles/tokens.css`)

| Token | Value | Description / Usage |
|---|---|---|
| `--tm-bg` | `#000000` | Pure black primary canvas background |
| `--tm-bg-subtle` | `#080808` | Slightly elevated panel backgrounds |
| `--tm-bg-glass` | `rgba(255, 255, 255, 0.03)` | Base frosted glass fill for cards |
| `--tm-bg-glass-elevated` | `rgba(255, 255, 255, 0.06)` | Hovered or focused glass surfaces |
| `--tm-bg-glass-popover` | `rgba(10, 10, 15, 0.85)` | High contrast popovers and floating data chips |
| `--tm-lime` | `#c6f432` | Signature lime accent for active states, CTA, and badges |
| `--tm-lime-dim` | `rgba(198, 244, 50, 0.15)` | Active pill and badge background fills |
| `--tm-violet-core` | `#6d28d9` | Core violet tone for ambient hero glow and planet sphere |
| `--tm-violet-light` | `#8b5cf6` | Top sphere highlights and light aura |
| `--tm-text-primary` | `#ffffff` | High contrast headlines, active links, readings |
| `--tm-text-muted` | `#8a8a93` | Muted secondary copy, descriptors, units |
| `--tm-border-subtle` | `rgba(255, 255, 255, 0.08)` | Standard 1px perimeter border for cards & grids |

---

## 2. Typography Rules

- **Font Family**: Inter (`sans-serif`), JetBrains Mono (`monospace` for sensor metrics, code, timestamps).
- **Hero Display Headline**:
  - `font-size`: `clamp(44px, 5.6vw, 84px)`
  - `font-weight`: `300` (light)
  - `line-height`: `1.02`
  - `letter-spacing`: `-0.03em`
- **Section Headlines**:
  - `font-size`: `clamp(28px, 4vw, 48px)`
  - `font-weight`: `300` (light)
  - `letter-spacing`: `-0.03em`
- **Body Text**:
  - `font-size`: `14px` - `15px`
  - `color`: `#8a8a93`
  - `line-height`: `1.6`
- **Section Labels**:
  - `font-size`: `11px`
  - `letter-spacing`: `0.25em` (uppercase monospace brackets: `[ LABEL ]`)

---

## 3. UI Component Guide (`src/components/ui/`)

### `GlassCard`
- **When to use**: Containers for feature descriptions, preview widgets, data tables, and settings modules.
- **Styling**: `rgba(255,255,255,0.03)` glass fill, `1px rgba(255,255,255,0.08)` border, `blur(16px)`, `rounded-2xl`.
- **Props**: `hoverEffect` (subtle lift + border highlight), `elevated`.

### `Pill`
- **When to use**: Status tags, sample type selectors, filter categories.
- **Variants**: `'default'` (frosted), `'lime'` (accent active), `'muted'` (inactive).

### `Button`
- **When to use**: Call to action and user actions.
- **Variants**:
  - `'primary'`: `#c6f432` solid lime background, black bold text, glowing shadow (`0 0 24px rgba(198, 244, 50, 0.35)`).
  - `'secondary'`: Frosted glass background, 1px border, white text.
  - `'white'`: Solid white pill.

### `StatCard`
- **When to use**: Metric overviews (e.g. sensor readings, adulteration percentages, uptime).
- **Features**: Live count-up animation (`easeOutCubic`), customizable unit, icon container.

### `SectionLabel`
- **When to use**: Eyebrow badge above major section titles (e.g., `[ LIVE SAMPLE ]`, `[ DATA FLOW ]`).
- **Styling**: Monospace uppercase bracketed label with subtle border.

### `DataChip`
- **When to use**: Floating live metric displays (pH, TDS, Turbidity) orbiting or pinned near visualizations.
- **Styling**: High-contrast glass container with icon, metric label, and live value.

### `Tabs`
- **When to use**: Switching views (e.g., 24h / 7d / 30d timeframes or metric channels).
- **Features**: Smooth Framer Motion spring sliding pill indicator in lime (`#c6f432`).

### `PageHeader`
- **When to use**: Consistent top header for all interior pages (Dashboard, Analysis, History, etc.).
- **Props**: `badge`, `title`, `description`, `actions`.

### `Table`, `TableRow`, `TableCell`
- **When to use**: Historical logs, sample calibration runs, sensor streaming logs.
- **Styling**: Dark glass background, border-b dividers, subtle hover row highlight.

### `Drawer`
- **When to use**: Mobile navigation drawer, slide-out sample detail inspector, settings pane.
- **Features**: Backdrop blur overlay, spring slide animation from right or left edge.

### `Skeleton`
- **When to use**: Loading states while fetching live readings or historical sets from `api.js`.
- **Variants**: `'rect'`, `'circle'`, `'text'`.

### `EmptyState`
- **When to use**: When search filters, calibrations, or historical logs return 0 items.

---

## 4. Layout Architecture (`src/components/layout/AppLayout.jsx`)

All interior pages (`/dashboard`, `/analysis`, `/history`, `/rasa-guide`, `/assistant`, etc.) can wrap their content in `AppLayout` to inherit:
1. **Fixed Navbar** with 40px baseline alignment and blur on scroll.
2. **Ambient Bottom Glow**: Violet-to-purple radial aura at bottom-center.
3. **Guide Lines**: 1/3 and 2/3 vertical faint grid lines.
4. **Subtle Grain**: Micro-noise texture for realistic dark-mode depth.
