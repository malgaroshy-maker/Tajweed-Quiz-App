'use client'

import { useTransition } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { moveQuiz } from '@/app/teacher/quizzes/move-quiz-action'

export function MoveQuizSelect({ quizId, currentFolderId, folders }: { quizId: string, currentFolderId: string | null, folders: { id: string, name: string }[] }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Select 
      defaultValue={currentFolderId || 'null'} 
      onValueChange={(val) => startTransition(() => moveQuiz(quizId, val === 'null' ? null : val))}
      disabled={isPending}
    >
      <SelectTrigger className="w-[160px] h-9 text-xs">
        <SelectValue placeholder="بدون مجلد" />
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
