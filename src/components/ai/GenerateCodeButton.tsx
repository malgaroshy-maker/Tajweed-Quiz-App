'use client'

import { Button } from '../ui/button'
import { Key } from 'lucide-react'

export function GenerateCodeButton() {
    const handleClick = async () => {
        const res = await fetch('/api/teacher/generate-code', { method: 'POST' });
        const data = await res.json();
        if (data.code) alert('كود المعلم الجديد: ' + data.code);
        else alert('خطأ: ' + data.error);
    }
    
    return (
        <Button variant="outline" className="justify-start gap-2 h-auto py-3 px-3 col-span-2" onClick={handleClick}>
            <Key className="w-4 h-4 text-amber-500" />
            <span>توليد كود دعوة معلم جديد</span>
        </Button>
    )
}
