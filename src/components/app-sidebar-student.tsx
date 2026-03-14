"use client"

import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  LogOut,
  Search,
  History,
  BookOpen,
  User
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

const items = [
  {
    title: "لوحة التحكم",
    url: "/student",
    icon: LayoutDashboard,
  },
  {
    title: "الانضمام باختبار (رمز)",
    url: "/student/join",
    icon: Search,
  },
  {
    title: "نتائجي السابقة",
    url: "/student/history",
    icon: History,
  },
]

export function AppSidebarStudent() {
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
    <Sidebar side="right" className="border-l">
      <SidebarHeader className="h-20 flex flex-col items-center justify-center border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-primary">رتل وارتق</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">بوابة الطالب</span>
      </SidebarHeader>
      <SidebarContent>
        {profile && (
          <div className="p-4 border-b bg-muted/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                <User className="w-5 h-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-sm truncate">{profile.first_name} {profile.last_name}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">طالب</span>
              </div>
            </div>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => router.push(item.url)}
                      className={`h-10 px-3 transition-all ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'}`}
                    >
                      <item.icon className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton type="submit" className="w-full justify-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive h-10 border border-destructive/20 rounded-md transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="font-semibold">تسجيل الخروج</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
