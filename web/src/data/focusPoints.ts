// Timeline focus anchors, in the same order as the résumé entries in ui/Resume.tsx.
// This is the single source of truth for "how many timeline stops are there": Resume.tsx
// tags each entry with one of these as its data-point, and scene/Scene2D.tsx reads those
// tags to decide which bandage on the cover to zoom to.
//
// To add or remove a résumé entry, change this list and Resume.tsx's entries together —
// the counts must match, and Scene2D's POINTS needs one coordinate pair per name here.
export const FOCUS_POINTS = ['focus-1', 'focus-2', 'focus-3', 'focus-4', 'focus-5'] as const
