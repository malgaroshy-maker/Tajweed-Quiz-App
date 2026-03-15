'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Settings, Save, Moon, Type, Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'
import { saveSettings } from './actions'

interface Model {
  id: string;
  name: string;
}

interface Profile {
  ai_provider?: string;
  openrouter_api_key?: string;
  openrouter_model?: string;
  gemini_api_key?: string;
  gemini_model?: string;
}

export function SettingsPageClient({ 
  profile, 
  freeModels, 
  geminiModels 
}: { 
  profile: Profile | null, 
  freeModels: Model[], 
  paidModels: Model[], 
  geminiModels: Model[] 
}) {
  const [provider, setProvider] = useState(profile?.ai_provider || 'openrouter')
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-3xl mx-auto space-y-10 p-4">
      <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-primary/10 shadow-sm transition-premium hover:shadow-md">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner transition-premium hover:rotate-12">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">الإعدادات</h2>
          <p className="text-lg text-primary/70 font-bold">تخصيص تجربة شيختي الفاضلة</p>
        </div>
      </div>

      <Card className="parchment-card border-none shadow-2xl rounded-[3rem] overflow-hidden group transition-premium hover:scale-[1.01]">
        <CardHeader className="p-10 pb-6">
          <CardTitle className="text-3xl font-black text-slate-900 flex items-center gap-4">
            إعدادات الذكاء الاصطناعي
          </CardTitle>
          <CardDescription className="text-lg text-slate-500 font-bold pt-2">
            اختيار العقل المفكر (AI) الذي يساعدكِ في صياغة الأسئلة بدقة واحترافية.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-0">
          <form action={saveSettings} className="space-y-12">
            <div className="space-y-6">
              <Label className="text-xs font-black uppercase tracking-[0.3em] text-primary/60 pr-2">1. مزود الخدمة المفضل</Label>
              <RadioGroup name="provider" value={provider} onValueChange={setProvider} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-4 space-x-reverse border-2 p-6 rounded-3xl cursor-pointer transition-premium hover:shadow-xl has-[:checked]:border-primary has-[:checked]:bg-primary/5 group/radio">
                  <RadioGroupItem value="openrouter" id="openrouter" className="text-primary w-6 h-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <Label htmlFor="openrouter" className="cursor-pointer font-black flex-1 text-xl pr-2">OpenRouter</Label>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse border-2 p-6 rounded-3xl cursor-pointer transition-premium hover:shadow-xl has-[:checked]:border-primary has-[:checked]:bg-primary/5 group/radio">
                  <RadioGroupItem value="gemini" id="gemini" className="text-primary w-6 h-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <Label htmlFor="gemini" className="cursor-pointer font-black flex-1 text-xl pr-2">Google Gemini</Label>
                </div>
              </RadioGroup>
            </div>

            {provider === 'openrouter' && (
              <div className="space-y-8 p-8 vellum-glass rounded-[2.5rem] border-2 border-primary/5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <Label htmlFor="openrouter_key" className="text-sm font-black text-slate-600 pr-2">مفتاح OpenRouter API</Label>
                  <Input 
                    id="openrouter_key" 
                    name="openrouter_key" 
                    type="password" 
                    defaultValue={profile?.openrouter_api_key || ''} 
                    placeholder="sk-or-v1-..." 
                    className="h-16 rounded-2xl border-2 border-primary/10 bg-white/50 focus-visible:ring-primary font-mono text-lg shadow-inner"
                  />
                  <p className="text-xs text-slate-400 font-bold pt-2 pr-2 italic">
                    للحصول على مفتاح مجاني: <a href="https://openrouter.ai/keys" target="_blank" className="text-primary hover:underline font-black">اضغطي هنا</a>
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="openrouter_model" className="text-sm font-black text-slate-600 pr-2">النموذج الذكي (Model)</Label>
                  <div className="relative">
                    <select
                        id="openrouter_model"
                        name="openrouter_model"
                        defaultValue={profile?.openrouter_model || 'auto-quality-free'}
                        className="flex h-16 w-full rounded-2xl border-2 border-primary/10 bg-white/50 px-6 text-xl shadow-inner focus:border-primary outline-none font-black appearance-none"
                    >
                        <optgroup label="الأداء الموصى به (مجاني)" className="font-black text-primary">
                        <option value="auto-quality-free" className="text-foreground font-bold">
                            دقة عالية (الأفضل أداءً مجاناً)
                        </option>
                        <option value="openrouter/free" className="text-foreground font-bold">
                            الأسرع (أي نموذج مجاني متاح)
                        </option>
                        </optgroup>
                        {freeModels.length > 0 && (
                        <optgroup label="تحديد نموذج مجاني يدوياً" className="font-black text-green-600">
                            {freeModels.map((m) => (
                            m.id !== 'openrouter/free' && (
                                <option key={m.id} value={m.id} className="text-foreground font-bold">
                                {m.name}
                                </option>
                            )
                            ))}
                        </optgroup>
                        )}
                    </select>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <Type className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {provider === 'gemini' && (
              <div className="space-y-8 p-8 vellum-glass rounded-[2.5rem] border-2 border-primary/5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <Label htmlFor="gemini_key" className="text-sm font-black text-slate-600 pr-2">مفتاح Google Gemini API</Label>
                  <Input 
                    id="gemini_key" 
                    name="gemini_key" 
                    type="password" 
                    defaultValue={profile?.gemini_api_key || ''} 
                    placeholder="AIzaSy..." 
                    className="h-16 rounded-2xl border-2 border-primary/10 bg-white/50 focus-visible:ring-primary font-mono text-lg shadow-inner"
                  />
                  <p className="text-xs text-slate-400 font-bold pt-2 pr-2 italic">
                    احصلي على مفتاح مجاني من <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary hover:underline font-black">Google AI Studio</a>
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="gemini_model" className="text-sm font-black text-slate-600 pr-2">إصدار Gemini المفضل</Label>
                  <div className="relative">
                    <select
                        id="gemini_model"
                        name="gemini_model"
                        defaultValue={profile?.gemini_model || 'gemini-2.0-flash'}
                        className="flex h-16 w-full rounded-2xl border-2 border-primary/10 bg-white/50 px-6 text-xl shadow-inner focus:border-primary outline-none font-black appearance-none"
                    >
                        {geminiModels.length > 0 ? (
                        geminiModels.map((m) => (
                            <option key={m.id} value={m.id} className="text-foreground font-bold">
                            {m.name} ({m.id})
                            </option>
                        ))
                        ) : (
                        <option value="gemini-2.0-flash" className="font-bold">Gemini 2.0 Flash (الافتراضي)</option>
                        )}
                    </select>
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full h-20 text-2xl font-black rounded-3xl bg-primary text-white shadow-2xl shadow-primary/30 gap-4 transition-premium hover:scale-[1.02] active:scale-95">
              <Save className="w-8 h-8" />
              حفظ جميع الإعدادات
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card className="parchment-card border-none shadow-xl rounded-[3rem] overflow-hidden group transition-premium hover:scale-[1.01]">
        <CardHeader className="p-10 pb-6">
          <CardTitle className="text-3xl font-black text-slate-900">إعدادات العرض</CardTitle>
        </CardHeader>
        <CardContent className="p-10 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </CardContent>
      </Card>
    </div>
  )
}

