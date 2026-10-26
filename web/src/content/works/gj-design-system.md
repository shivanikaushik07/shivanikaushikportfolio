---
title: Growth Jockey Design System
role: Design system · Dark theme
tags: [Design System, Dark Theme, Accessibility, Components]
---

## Project overview

A dark-only design system for Growth Jockey, covering both the marketing site and the products built on it. Not drawn up in advance — pulled out of two shipped builds, the Intellsys hiring dashboard and the Build with US intake flow, once the patterns had proved themselves twice.

## The principle

Nothing enters the system on speculation. A component earns its place by being needed in two places, which is why the library is small and why none of it is decorative.

## Colour

One theme, dark only, anchored by Jockey Blue on a 60/30/10 balance: the background dominates, secondary greys do the structuring, and blue is reserved for actions and emphasis.

```palette
cols: 5
Product Blue 400 | #3D9BFF
Product Blue 600 | #0E4FD8
Site Cyan 500 | #00A2ED
Background 500 | #0F1117
Secondary 100 | #1A1D26
```

```palette
cols: 5
Secondary 300 | #3A3F4B
Secondary 500 | #828795
Secondary 700 | #B8BCC7
Secondary 900 | #FCFCFC
Success | #27AE60
```

```palette
cols: 5
Warning | #F2B34C
Error | #F0716A
Brand gradient | linear-gradient(90deg,#3D9BFF,#0E4FD8) | 400 → 600
Complimentary | linear-gradient(90deg,#0E4FD8,#051C2A) | 600 → #051C2A
Scrim | #051C2A | 60%
```

```note
Service lines carry their own coding across calendar and charts:
Marketing 360 #3D9BFF · Technology #0E4FD8 · Growth #27AE60 · Brand & Design #F2B34C · Internal #828795
```

## Typography

Poppins across product and marketing, letter-spacing 0 throughout. Six styles, two sizes each for mobile and desktop, and body text never renders below 14px. Headings run at 700; supporting headline pairs use a light 400 beneath a bold line, the pattern the site heroes already used.

```slots
TYPE SCALE — SIX STYLES, MOBILE & DESKTOP
```

## Icons

Outlined, 24px grid, 1.5px stroke, rounded caps and joins. One style everywhere — filled and outlined never share a view. The stroke stays 1.5px at every size, so the artboard scales and the stroke doesn't. Blue is reserved for interactive or featured icons.

## Spacing

A 4px base and eight steps, with nothing between them. 4 for icon-to-label, 8 label to field, 16 field insets, 24 card padding and gutters, 32 card grids and modals, 40 block separation, 56 section-to-section rhythm.

```slots
SPACING — APPLIED INPUT ANATOMY
```

## Elevation

On a dark theme elevation is surface colour first and shadow second: each level up gets a lighter surface and a 1px border, and only floating layers add a shadow. Level 0 is the page at #0F1117, level 1 cards and fields at #1A1D26, levels 2 and 3 dropdowns and modals at #20242E. Never more than two floating layers stacked.

## Accessibility

WCAG 2.2 AA is the floor, not the target. Every interactive element carries a visible focus ring — 2px #FCFCFC at 3px offset — and a 44 × 44px minimum touch target.

- Secondary 900 on Background 500 clears 17.6:1; Secondary 700 clears 8.5:1
- White on Primary 500 only reaches 2.8:1, so it is used for large or bold text only
- Secondary 500 on the background is 3.9:1 — placeholder text, nothing else
- Status always pairs colour with an icon and a label, never colour alone

## Components

One primary action per view. Buttons are 48px tall, 32px horizontal padding, fully rounded, label at 16/600; the primary carries the blue gradient and loading replaces the label without changing the width.

```rows
Radio cards | The selected choice explains its own consequence in the same breath, so no separate helper block is needed.
Range slider | Snaps to named bands rather than returning a number.
Rich-text editor | Six tools, no more, and it appears only when a description is needed.
Navigation | 64px top bar on marketing, 240px sidebar with five nouns on product; the active item carries the only accent.
Feedback | Banners for page-level context, toasts for transient confirmation, inline messages for field errors.
Overlays | 60% scrim, modals capped at 560px, slide-over panel at 480px so the list behind never disappears.
Charts | Data ink first. No 3D, no gridline clutter, one accent series, and meaning never encoded in colour alone.
```

```slots
COMPONENT LIBRARY — BUTTONS, INPUTS, NAVIGATION, FEEDBACK
OVERLAYS, PANELS & CHARTS
```

## Outcome

Two products shipped on the system within the same year.

```note
To add: adoption detail — components reused across builds, and how much of each
new screen came out of the library rather than being drawn fresh.
```
