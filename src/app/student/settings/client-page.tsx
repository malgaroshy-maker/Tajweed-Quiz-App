'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Settings, Moon, Type, Palette } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useThemeColor } from '@/components/theme-color-provider'

export function StudentSettingsClient() {
  const { theme, setTheme } = useTheme()
  const { themeColor, setThemeColor } = useThemeColor()

  return (
    <div className="max-w-3xl mx-auto space-y-10 p-4">
      <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-primary/10 shadow-sm transition-premium hover:shadow-md">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner transition-premium hover:rotate-12">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">الإعدادات</h2>
          <p className="text-lg text-primary/70 font-bold">تخصيص تجربة التعلم الخاصة بك</p>
        </div>
      </div>

      <Card className="parchment-card border-none shadow-xl rounded-[3rem] overflow-hidden group transition-premium hover:scale-[1.01]">
        <CardHeader className="p-10 pb-6">
          <CardTitle className="text-3xl font-black text-slate-900">إعدادات العرض</CardTitle>
        </CardHeader>
        <CardContent className="p-10 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center justify-between p-8 vellum-glass rounded-[2rem] border border-primary/5 shadow-sm transition-premium hover:border-primary/20">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg transition-premium group-hover:rotate-12">
                  <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-slate-900' : 'text-white'}`} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xl font-black text-slate-800 dark:text-white">مظهر المنصة</Label>
                  <p className="text-sm text-slate-500 font-bold">تبديل بين الفاتح والداكن</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-2xl h-14 px-8 font-black text-lg border-2 hover:bg-primary hover:text-white transition-premium"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الليلي'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-8 vellum-glass rounded-[2rem] border border-primary/5 shadow-sm transition-premium hover:border-primary/20">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg transition-premium group-hover:rotate-12">
                  <Type className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xl font-black text-slate-800 dark:text-white">خط القرآن</Label>
                  <p className="text-sm text-slate-500 font-bold">تعديل حجم عرض الآيات</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-2 font-black text-xl hover:bg-primary hover:text-white transition-premium">-</Button>
                <div className="bg-white/50 px-6 py-2 rounded-xl border-2 font-black text-xl shadow-inner">24</div>
                <Button size="icon" variant="outline" className="rounded-xl h-12 w-12 border-2 font-black text-xl hover:bg-primary hover:text-white transition-premium">+</Button>
              </div>
            </div>
          </div>
          
          <div className="p-8 vellum-glass rounded-[2rem] border border-primary/5 shadow-sm transition-premium hover:border-primary/20">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg transition-premium group-hover:rotate-12">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xl font-black text-slate-800 dark:text-white">السمة البصرية (Theme)</Label>
                  <p className="text-sm text-slate-500 font-bold">اختيار الألوان والروح البصرية للمنصة</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <Button 
                    variant="outline" 
                    className={`h-20 rounded-2xl border-2 font-black text-lg transition-premium flex flex-col gap-2 justify-center items-center ${themeColor === 'al-qalam' ? 'border-[#666600] bg-[#666600]/10 text-[#666600]' : 'border-[#d4c3a3] bg-white/50 text-slate-600'}`}
                    onClick={() => setThemeColor('al-qalam')}
                 >
                     <span>القلم (الافتراضي)</span>
                     <div className="flex gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#666600]" />
                        <div className="w-4 h-4 rounded-full bg-[#fffdf5]" />
                     </div>
                 </Button>
                 <Button 
                    variant="outline" 
                    className={`h-20 rounded-2xl border-2 font-black text-lg transition-premium flex flex-col gap-2 justify-center items-center ${themeColor === 'al-kaaba' ? 'border-[#10b981] bg-[#10b981]/10 text-[#10b981]' : 'border-[#d4c3a3] bg-white/50 text-slate-600'}`}
                    onClick={() => setThemeColor('al-kaaba')}
                 >
                     <span>الملكي فاخر (زمرد وذهبي)</span>
                     <div className="flex gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#000000]" />
                        <div className="w-4 h-4 rounded-full bg-[#10b981]" />
                        <div className="w-4 h-4 rounded-full bg-[#d4af37]" />
                     </div>
                 </Button>
                 <Button 
                    variant="outline" 
                    className={`h-20 rounded-2xl border-2 font-black text-lg transition-premium flex flex-col gap-2 justify-center items-center ${themeColor === 'al-lail' ? 'border-[#1e1b4b] bg-[#1e1b4b]/10 text-[#1e1b4b]' : 'border-[#d4c3a3] bg-white/50 text-slate-600'}`}
                    onClick={() => setThemeColor('al-lail')}
                 >
                     <span>الليل (كحلي عميق)</span>
                     <div className="flex gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#1e1b4b]" />
                        <div className="w-4 h-4 rounded-full bg-[#fde047]" />
                     </div>
                 </Button>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
