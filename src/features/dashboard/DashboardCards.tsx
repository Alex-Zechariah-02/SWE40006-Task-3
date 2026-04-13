"use client";

import { motion, useReducedMotion } from "motion/react";
import { Briefcase, Calendar, Clock } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import {
  reducedMotionTransition,
  staggerContainer,
  staggerItem,
  staggerItemTransition,
} from "@/lib/ui/animations";

interface DashboardCardsProps {
  activeApplications: number;
  upcomingInterviews: number;
  deadlinesNear: number;
}

export function DashboardCards({
  activeApplications,
  upcomingInterviews,
  deadlinesNear,
}: DashboardCardsProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-1 gap-6 sm:grid-cols-3"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div
        variants={staggerItem}
        transition={
          shouldReduceMotion ? reducedMotionTransition : staggerItemTransition
        }
        className="hover-lift"
      >
        <StatCard
          label="Active Applications"
          value={activeApplications}
          icon={Briefcase}
          href="/app/applications?activeOnly=true&includeArchived=false&sort=newest"
          interactive
        />
      </motion.div>
      <motion.div
        variants={staggerItem}
        transition={
          shouldReduceMotion ? reducedMotionTransition : staggerItemTransition
        }
        className="hover-lift"
      >
        <StatCard
          label="Upcoming Interviews"
          value={upcomingInterviews}
          icon={Calendar}
          href="/app/applications?stage=Interview&activeOnly=true&includeArchived=false&sort=newest"
          interactive
        />
      </motion.div>
      <motion.div
        variants={staggerItem}
        transition={
          shouldReduceMotion ? reducedMotionTransition : staggerItemTransition
        }
        className="hover-lift"
      >
        <StatCard
          label="Deadlines Near"
          value={deadlinesNear}
          icon={Clock}
          href="/app/opportunities?deadlineWindow=near&sort=deadline"
          interactive
        />
      </motion.div>
    </motion.div>
  );
}
