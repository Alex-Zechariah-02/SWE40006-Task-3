import * as React from "react"

import { cn } from "@/lib/utils"

function FormMessage({
  className,
  children,
  error,
  ...props
}: React.ComponentProps<"p"> & { error?: boolean }) {
  if (!children) return null

  return (
    <p
      data-slot="form-message"
      role={error ? "alert" : undefined}
      className={cn(
        "type-small",
        error ? "text-destructive" : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

export { FormMessage }
