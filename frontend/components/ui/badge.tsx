import { cn } from "@/lib/utils"

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800", className)}
      {...props}
    />
  )
}
