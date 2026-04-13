/**
 * Shared motion animation utilities for CareerDeck.
 * Import these configs into motion components for consistent animation behavior.
 *
 * Usage:
 *   import { scaleVariants, defaultTransition } from "@/lib/ui/animations";
 *   <motion.div variants={scaleVariants} initial="initial" animate="animate" exit="exit" transition={defaultTransition}>
 */

/** Standard fast ease-out for UI micro-interactions */
export const defaultTransition = {
  duration: 0.15,
  ease: "easeOut",
} as const;

/** Spring config for layout/positional animations */
export const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
} as const;

/** Transition for reduced-motion users (near-instant, no movement) */
export const reducedMotionTransition = {
  duration: 0.01,
} as const;

/** Fade only — use for tooltips, overlays */
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

/** Scale + fade — use for chips, badges, small interactive elements */
export const scaleVariants = {
  initial: { opacity: 0, scale: 0.88 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.88 },
} as const;

/** Slide up + fade — use for modals, drawers, dropdowns */
export const slideUpVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
} as const;

/** Slide down + fade — use for toasts, notifications */
export const slideDownVariants = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
} as const;

/** Page content entrance — subtle fade + slide up */
export const pageTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
} as const;

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
} as const;

/** Stagger container — wrap a list parent with this */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
} as const;

/** Stagger item — each child in a staggered list */
export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
} as const;

/** Stagger item transition */
export const staggerItemTransition = {
  duration: 0.2,
  ease: "easeOut",
} as const;


