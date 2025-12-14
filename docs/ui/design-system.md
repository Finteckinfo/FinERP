# FinERP UI Design System (Baseline)

This document defines the **baseline design rules** for FinERP so the UI stays modern, sleek, responsive, and readable in **both light and dark** themes.

## Design principles

- **Clarity first**: readable typography, consistent spacing, predictable layouts.
- **Accessible contrast**: text must be legible in both themes.
- **Token-driven**: use CSS variables (design tokens) instead of hard-coded colors.
- **Responsive by default**: mobile-first layouts, no horizontal scroll.

## Theme architecture

FinERP uses CSS variables defined in `src/index.css` (e.g. `--erp-page-bg`, `--erp-text`, `--erp-border`) and toggles them by adding/removing the `.dark-theme` class.

### Rules

- Use `var(--erp-...)` tokens for:
  - backgrounds
  - borders
  - text colors
  - accents
- Avoid hard-coded hex values in components unless absolutely necessary.

## Typography

### Goals
- Body text should never be “washed out” in light mode or “dim” in dark mode.
- Avoid gray-on-gray combinations that fail contrast.

### Recommended scale (can be adjusted)

- **H1**: 40–56px (desktop), 28–36px (mobile)
- **H2**: 28–36px (desktop), 22–28px (mobile)
- **Body**: 14–16px
- **Captions**: 12–13px (only for secondary meta text)

## Layout + spacing

- Use an 8px spacing grid: 8 / 16 / 24 / 32 / 48 / 64.
- Primary CTAs should be reachable and full-width on mobile where appropriate.
- Avoid fixed-position overlays that can block navigation or CTAs.

## Components

### Buttons

- Primary button: high-contrast background, readable label.
- Secondary button: outline variant, visible border in both themes.
- Tap targets: minimum 40x40px.

### Cards

- Card background = `--erp-card-bg`
- Border = `--erp-border`
- Avoid shadows that disappear in dark mode; prefer subtle borders + soft shadow only if needed.

## Responsiveness checklist

- No component should overlap the navbar CTAs.
- The theme toggle must never be positioned as a fixed overlay in the click-path of key buttons.
- Text wraps correctly (no clipped titles on mobile).

## Next steps (implementation plan)

1. Unify the landing page styles to use ERP tokens.
2. Normalize typography and spacing across:
   - landing
   - dashboard
   - project create/fund flows
3. Add a “contrast guardrail” pass for:
   - muted text
   - borders
   - card backgrounds


