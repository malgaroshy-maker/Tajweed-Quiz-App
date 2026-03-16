'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pencil } from 'lucide-react'

interface RenameDialogProps {
    id: string
    currentName: string
    onRename: (id: string, newName: string) => Promise<void>
}

export function RenameDialog({ id, currentName, onRename }: RenameDialogProps) {
    const [newName, setNewName] = useState(currentName)
    const [open, setOpen] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onRename(id, newName)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl transition-premium hover:bg-primary/10">
                    <Pencil className="h-5 w-5 text-primary" />
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl parchment-card border-none shadow-2xl p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">إعادة تسمية</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        className="h-14 rounded-2xl border-2 border-primary/20 bg-white/50 focus-visible:ring-primary font-bold shadow-inner"
                    />
                    <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl hover:scale-[1.02] transition-premium">حفظ التغييرات</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
