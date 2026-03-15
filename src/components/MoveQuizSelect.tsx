'use client'

import { useTransition, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { moveQuiz } from '@/app/teacher/quizzes/move-quiz-action'

export function MoveQuizSelect({ quizId, currentFolderId, folders }: { quizId: string, currentFolderId: string | null, folders: { id: string, name: string }[] }) {
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(currentFolderId || 'null')

  const handleChange = (val: string | null) => {
    if (!val) return
    setValue(val)
    startTransition(async () => {
        await moveQuiz(quizId, val === 'null' ? null : val)
    })
  }

  const getFolderName = (id: string | null) => {
    if (id === 'null' || id === null) return 'بدون مجلد'
    const folder = folders.find(f => f.id === id)
    return folder ? folder.name : 'بدون مجلد'
  }

  return (
    <Select 
      value={value}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[160px] h-9 text-xs">
        <SelectValue placeholder="بدون مجلد">
            {getFolderName(value)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="null">بدون مجلد</SelectItem>
        {folders.map(f => (
          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
