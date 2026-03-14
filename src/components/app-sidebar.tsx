"use client"

import { useEffect, useState } from "react"
import {
  BookOpen,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Settings,
  BarChart2,
  Database,
  BadgeCheck,
  Heart,
  Library,
  Users
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { logout } from "@/app/login/logout"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

// Menu items
const items = [
  {
    title: "لوحة التحكم",
    url: "/teacher",
    icon: LayoutDashboard,
  },
  {
    title: "الاختبارات",
    url: "/teacher/quizzes",
    icon: Library,
  },
  {
    title: "نتائج الطلاب",
    url: "/teacher/results",
    icon: BarChart2,
  },
  {
    title: "طالباتي",
    url: "/teacher/students",
    icon: Users,
  },
  {
    title: "مجلداتي",
    url: "/teacher/folders",
    icon: FolderOpen,
  },
  {
    title: "بنك الأسئلة",
    url: "/teacher/questions",
    icon: Database,
  },
  {
    title: "المساعد الذكي (AI)",
    url: "/teacher/ai",
    icon: Sparkles,
  },
  {
    title: "الإعدادات",
    url: "/teacher/settings",
    icon: Settings,
  },
  {
    title: "عن التطبيق",
    url: "/about",
    icon: Heart,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    getProfile()
  }, [])

  return (
    <Sidebar side="right" className="border-l bg-primary text-white shadow-2xl z-20">
      <SidebarHeader className="p-8 border-b border-white/10 flex flex-col items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-lg">
            <BookOpen className="w-8 h-8 font-bold" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold leading-none tracking-tight">القلم</h2>
            <p className="text-[10px] text-white/60 mt-1 uppercase tracking-widest font-medium">Al-Qalam Portal</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-primary">
        {profile && (
          <div className="px-6 py-6 border-b border-white/5">
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-white/20 flex items-center justify-center text-white font-bold">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-bold truncate text-white">{profile.first_name} {profile.last_name}</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Senior Instructor</p>
              </div>
            </div>
          </div>
        )}
        <SidebarGroup className="p-4 space-y-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => router.push(item.url)}
                      className={`h-12 px-4 rounded-xl transition-all duration-200 flex items-center gap-4 ${isActive ? "bg-white/15 text-white shadow-lg shadow-black/10" : "hover:bg-white/10 text-white/70 hover:text-white"}`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-white/70"}`} />
                      <span className={`text-base ${isActive ? "font-bold" : "font-medium"}`}>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6 space-y-4 bg-primary">
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton type="submit" className="w-full py-6 bg-white text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-xl">
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
