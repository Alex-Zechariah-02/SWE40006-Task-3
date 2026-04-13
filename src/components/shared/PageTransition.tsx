"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  pageVariants,
  pageTransition,
  reducedMotionTransition,
} from "@/lib/ui/animations";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({
  children,
  className,
}: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants}
      transition={shouldReduceMotion ? reducedMotionTransition : pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
