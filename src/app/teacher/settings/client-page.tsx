'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Settings } from 'lucide-react'
import { saveSettings } from './actions'

export function SettingsPageClient({ profile, freeModels, paidModels, geminiModels }: { profile: any, freeModels: any[], paidModels: any[], geminiModels: any[] }) {
  const [provider, setProvider] = useState(profile?.ai_provider || 'openrouter')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-bold">الإعدادات</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات المساعد الذكي (AI)</CardTitle>
          <CardDescription>
            اختر مزود خدمة الذكاء الاصطناعي لتوليد أسئلة التجويد بدقة عالية.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveSettings} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg">مزود الخدمة</Label>
              <RadioGroup name="provider" value={provider} onValueChange={setProvider} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3 space-x-reverse border p-4 rounded-lg cursor-pointer">
                  <RadioGroupItem value="openrouter" id="openrouter" />
                  <Label htmlFor="openrouter" className="cursor-pointer font-bold flex-1">OpenRouter (نماذج متعددة مجانية)</Label>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse border p-4 rounded-lg cursor-pointer">
                  <RadioGroupItem value="gemini" id="gemini" />
                  <Label htmlFor="gemini" className="cursor-pointer font-bold flex-1">Google Gemini API (مباشر ومجاني للمطورين)</Label>
                </div>
              </RadioGroup>
            </div>

            {provider === 'openrouter' && (
              <div className="space-y-6 p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="openrouter_key">مفتاح OpenRouter API</Label>
                  <Input 
                    id="openrouter_key" 
                    name="openrouter_key" 
                    type="password" 
                    defaultValue={profile?.openrouter_api_key || ''} 
                    placeholder="sk-or-v1-..." 
                  />
                  <p className="text-xs text-muted-foreground">
                    للحصول على مفتاح مجاني: <a href="https://openrouter.ai/keys" target="_blank" className="text-primary hover:underline">اضغط هنا</a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openrouter_model">النموذج (Model)</Label>
                  <select
                    id="openrouter_model"
                    name="openrouter_model"
                    defaultValue={profile?.openrouter_model || 'auto-quality-free'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                  >
                    <optgroup label="خيارات ذكية ومجانية (ينصح بها)" className="font-bold text-primary">
                      <option value="auto-quality-free" className="text-foreground font-normal">
                        دقة عالية (يبحث تلقائياً عن أفضل نموذج 70B مجاني)
                      </option>
                      <option value="openrouter/free" className="text-foreground font-normal">
                        الأسرع (يختار أي نموذج مجاني متاح حالياً)
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
              <div className="space-y-6 p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="gemini_key">مفتاح Google Gemini API</Label>
                  <Input 
                    id="gemini_key" 
                    name="gemini_key" 
                    type="password" 
                    defaultValue={profile?.gemini_api_key || ''} 
                    placeholder="AIzaSy..." 
                  />
                  <p className="text-xs text-muted-foreground">
                    احصل على مفتاح مجاني من <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary hover:underline">Google AI Studio</a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gemini_model">النموذج (Model)</Label>
                  <select
                    id="gemini_model"
                    name="gemini_model"
                    defaultValue={profile?.gemini_model || 'gemini-2.0-flash'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
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

            <Button type="submit" className="w-full">حفظ الإعدادات</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
