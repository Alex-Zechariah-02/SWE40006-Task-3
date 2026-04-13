import { Check, MinusCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StageTimelineProps {
  currentStage: string;
  className?: string;
}

const PROGRESSION_STAGES = [
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
] as const;

type StepState =
  | "completed"
  | "active"
  | "pending"
  | "terminal-rejected"
  | "terminal-withdrawn";

type Step = {
  label: string;
  state: StepState;
  isCurrent: boolean;
};

function buildSteps(currentStage: string): Step[] {
  if (currentStage === "Rejected") {
    return [
      ...PROGRESSION_STAGES.map((label) => ({
        label,
        state: "pending" as const,
        isCurrent: false,
      })),
      {
        label: "Rejected",
        state: "terminal-rejected" as const,
        isCurrent: true,
      },
    ];
  }

  if (currentStage === "Withdrawn") {
    return [
      ...PROGRESSION_STAGES.map((label) => ({
        label,
        state: "pending" as const,
        isCurrent: false,
      })),
      {
        label: "Withdrawn",
        state: "terminal-withdrawn" as const,
        isCurrent: true,
      },
    ];
  }

  const currentIndex = PROGRESSION_STAGES.indexOf(
    currentStage as (typeof PROGRESSION_STAGES)[number]
  );

  return PROGRESSION_STAGES.map((label, index) => ({
    label,
    state:
      currentIndex === -1
        ? "pending"
        : index < currentIndex
          ? "completed"
          : index === currentIndex
            ? "active"
            : "pending",
    isCurrent: index === currentIndex,
  }));
}

function getDotClasses(state: StepState) {
  if (state === "completed") {
    return "flex size-7 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground";
  }

  if (state === "active") {
    return "flex size-7 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground ring-4 ring-primary/15";
  }

  if (state === "terminal-rejected") {
    return "flex size-7 items-center justify-center rounded-full border border-destructive bg-destructive text-primary-foreground ring-4 ring-destructive/15";
  }

  if (state === "terminal-withdrawn") {
    return "flex size-7 items-center justify-center rounded-full border border-muted-foreground bg-muted-foreground text-background ring-4 ring-muted-foreground/15";
  }

  return "flex size-7 items-center justify-center rounded-full border border-muted-foreground/30 bg-background";
}

function getLabelClasses(state: StepState) {
  if (state === "active") {
    return "mt-2 text-center text-xs font-medium text-foreground";
  }

  if (state === "terminal-rejected") {
    return "mt-2 text-center text-xs font-medium text-destructive";
  }

  if (state === "terminal-withdrawn") {
    return "mt-2 text-center text-xs font-medium text-muted-foreground";
  }

  return "mt-2 text-center text-xs text-muted-foreground";
}

function getConnectorClasses(currentStep: Step, nextStep: Step) {
  if (nextStep.state === "terminal-rejected") {
    return "mt-3.5 h-0.5 min-w-2 flex-1 rounded-full bg-destructive/40";
  }

  if (nextStep.state === "terminal-withdrawn") {
    return "mt-3.5 h-0.5 min-w-2 flex-1 rounded-full bg-muted-foreground/30";
  }

  if (currentStep.state === "completed") {
    return "mt-3.5 h-0.5 min-w-2 flex-1 rounded-full bg-primary";
  }

  return "mt-3.5 h-0.5 min-w-2 flex-1 rounded-full border-t border-dashed border-muted-foreground/30";
}

export function StageTimeline({
  currentStage,
  className,
}: StageTimelineProps) {
  const steps = buildSteps(currentStage);

  return (
    <div
      aria-label="Application stage progress"
      className={cn("w-full rounded-lg border bg-card px-4 py-5", className)}
    >
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1;

          return (
            <li
              key={step.label}
              aria-current={step.isCurrent ? "step" : undefined}
              className={cn(
                "flex min-w-0 items-start",
                isLastStep ? "shrink-0" : "flex-1"
              )}
            >
              <div className="flex w-14 shrink-0 flex-col items-center sm:w-16">
                <span className={getDotClasses(step.state)}>
                  {step.state === "completed" ? (
                    <Check className="size-3.5" />
                  ) : step.state === "terminal-rejected" ? (
                    <XCircle className="size-3.5" />
                  ) : step.state === "terminal-withdrawn" ? (
                    <MinusCircle className="size-3.5" />
                  ) : null}
                </span>
                <span className={getLabelClasses(step.state)}>{step.label}</span>
              </div>

              {!isLastStep ? (
                <div className={getConnectorClasses(step, steps[index + 1])} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
