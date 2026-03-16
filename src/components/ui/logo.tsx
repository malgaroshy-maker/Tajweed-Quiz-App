import { cn } from "@/lib/utils"
import { Feather } from "lucide-react"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
        <svg viewBox="0 0 24 24" fill="none" className="absolute inset-0 opacity-20 rotate-45 scale-150">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
        </svg>
        <Feather className="w-full h-full relative z-10" />
    </div>
  )
}
