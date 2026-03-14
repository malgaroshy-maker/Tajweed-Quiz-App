import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar"
import { Sparkles } from "lucide-react"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="parchment-texture min-h-screen">
       <header className="flex h-20 shrink-0 items-center justify-between gap-2 border-b border-primary/10 bg-background/95 backdrop-blur-md sticky top-0 z-50 px-8">
          <div className="flex items-center gap-6">
            <SidebarTrigger className="h-10 w-10 text-primary hover:bg-primary/10 transition-colors" />
            <div className="h-6 w-[1px] bg-primary/20 hidden md:block"></div>
            <h1 className="font-black text-xl text-foreground tracking-tight">لوحة المعلمة</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

