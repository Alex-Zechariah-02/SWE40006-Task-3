import { cn } from "@/lib/utils";
import { PageTransition } from "./PageTransition";

type ContainerWidth = "narrow" | "default" | "wide" | "full";

const widthClasses: Record<ContainerWidth, string> = {
  narrow: "max-w-xl",
  default: "max-w-4xl",
  wide: "max-w-6xl",
  full: "max-w-7xl",
};

interface PageContainerProps {
  width?: ContainerWidth;
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  width = "wide",
  children,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-5 sm:px-6 lg:px-8",
        widthClasses[width],
        className
      )}
    >
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
