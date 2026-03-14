'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Settings, Save, Moon, Sun, Type } from 'lucide-react'
import { saveSettings } from './actions'

export function SettingsPageClient({ profile, freeModels, paidModels, geminiModels }: { profile: any, freeModels: any[], paidModels: any[], geminiModels: any[] }) {
  const [provider, setProvider] = useState(profile?.ai_provider || 'openrouter')

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
          <Settings className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">الإعدادات</h2>
          <p className="text-md text-primary/70 font-bold">تخصيص تجربة المعلمة</p>
        </div>
      </div>

      <Card className="rounded-3xl border-2 border-primary/10 shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-foreground">إعدادات المساعد الذكي (AI)</CardTitle>
          <CardDescription className="text-base text-muted-foreground pt-1">
            اختيار مزود الخدمة والنموذج الأمثل لتوليد أسئلة التجويد.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveSettings} className="space-y-10">
            <div className="space-y-4 border-b pb-6">
              <Label className="text-lg font-bold uppercase tracking-wider text-primary/80">1. مزود الخدمة</Label>
              <RadioGroup name="provider" value={provider} onValueChange={setProvider} className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3 space-x-reverse border p-5 rounded-2xl cursor-pointer transition-all hover:shadow-md has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="openrouter" id="openrouter" className="text-primary data-[state=checked]:bg-primary data-[state=checked]:text-white data-[state=checked]:border-primary" />
                  <Label htmlFor="openrouter" className="cursor-pointer font-black flex-1 text-lg">OpenRouter (نماذج مجانية)</Label>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse border p-5 rounded-2xl cursor-pointer transition-all hover:shadow-md has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="gemini" id="gemini" className="text-primary data-[state=checked]:bg-primary data-[state=checked]:text-white data-[state=checked]:border-primary" />
                  <Label htmlFor="gemini" className="cursor-pointer font-black flex-1 text-lg">Google Gemini API (مباشر)</Label>
                </div>
              </RadioGroup>
            </div>

            {provider === 'openrouter' && (
              <div className="space-y-6 p-6 bg-muted/30 dark:bg-slate-800/50 rounded-3xl border-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="openrouter_key" className="text-base font-bold">مفتاح OpenRouter API</Label>
                  <Input 
                    id="openrouter_key" 
                    name="openrouter_key" 
                    type="password" 
                    defaultValue={profile?.openrouter_api_key || ''} 
                    placeholder="sk-or-v1-..." 
                    className="h-14 rounded-xl text-lg font-mono"
                  />
                  <p className="text-xs text-muted-foreground pt-1">
                    للحصول على مفتاح مجاني: <a href="https://openrouter.ai/keys" target="_blank" className="text-primary hover:underline">اضغطي هنا</a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openrouter_model" className="text-base font-bold">النموذج (Model)</Label>
                  <select
                    id="openrouter_model"
                    name="openrouter_model"
                    defaultValue={profile?.openrouter_model || 'auto-quality-free'}
                    className="flex h-14 w-full rounded-xl border-2 border-muted bg-background px-4 text-lg shadow-sm focus-visible:ring-primary focus-visible:border-primary font-bold"
                  >
                    <optgroup label="الأداء الموصى به (مجاني)" className="font-bold text-primary">
                      <option value="auto-quality-free" className="text-foreground font-normal">
                        دقة عالية (الأفضل أداءً مجاناً)
                      </option>
                      <option value="openrouter/free" className="text-foreground font-normal">
                        الأسرع (أي نموذج مجاني متاح)
                      </option>
                    </optgroup>
                    {freeModels.length > 0 && (
                      <optgroup label="تحديد نموذج مجاني يدوياً" className="font-bold text-green-600 dark:text-green-400">
                        {freeModels.map((m: any) => (
                          m.id !== 'openrouter/free' && (
                            <option key={m.id} value={m.id} className="text-foreground font-normal">
                              {m.name}
                            </option>
                          )
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>
            )}

            {provider === 'gemini' && (
              <div className="space-y-6 p-6 bg-muted/30 dark:bg-slate-800/50 rounded-3xl border-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="gemini_key" className="text-base font-bold">مفتاح Google Gemini API</Label>
                  <Input 
                    id="gemini_key" 
                    name="gemini_key" 
                    type="password" 
                    defaultValue={profile?.gemini_api_key || ''} 
                    placeholder="AIzaSy..." 
                    className="h-14 rounded-xl text-lg font-mono"
                  />
                  <p className="text-xs text-muted-foreground pt-1">
                    احصلي على مفتاح مجاني من <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary hover:underline">Google AI Studio</a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gemini_model" className="text-base font-bold">النموذج (Model)</Label>
                  <select
                    id="gemini_model"
                    name="gemini_model"
                    defaultValue={profile?.gemini_model || 'gemini-2.0-flash'}
                    className="flex h-14 w-full rounded-xl border-2 border-muted bg-background px-4 text-lg shadow-sm focus-visible:ring-primary focus-visible:border-primary font-bold"
                  >
                    {geminiModels.length > 0 ? (
                      geminiModels.map((m: any) => (
                        <option key={m.id} value={m.id} className="text-foreground">
                          {m.name} ({m.id})
                        </option>
                      ))
                    ) : (
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Default)</option>
                    )}
                  </select>
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full h-14 text-xl font-black rounded-2xl shadow-lg shadow-primary/20 gap-2">
              <Save className="w-5 h-5" />
              حفظ إعدادات الذكاء الاصطناعي
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card className="rounded-3xl border-2 border-muted shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-foreground">إعدادات العرض العامة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-2xl bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">الوضع الليلي (Dark Mode)</Label>
                  <p className="text-sm text-muted-foreground">تبديل الواجهة للوضع المظلم.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full h-10 px-4 font-bold">
                تفعيل
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-2xl bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Type className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">حجم خط القرآن</Label>
                  <p className="text-sm text-muted-foreground">تعديل حجم عرض الآيات.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="rounded-xl h-10 w-10">-</Button>
                <span className="font-bold w-12 text-center text-lg">كبير</span>
                <Button size="icon" variant="outline" className="rounded-xl h-10 w-10">+</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
