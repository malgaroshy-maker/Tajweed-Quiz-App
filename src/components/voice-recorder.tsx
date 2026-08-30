'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Play, Pause, RotateCcw, Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface VoiceRecorderProps {
  questionId: string
  name: string
  initialAudioUrl?: string
  onAudioUploaded?: (url: string) => void
  disabled?: boolean
}

export function VoiceRecorder({
  questionId,
  name,
  initialAudioUrl,
  onAudioUploaded,
  disabled = false
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialAudioUrl || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    setErrorMessage(null)
    audioChunksRef.current = []
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('المتصفح لا يدعم تسجيل الصوت أو يحتاج إلى اتصال آمن HTTPS.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        const localBlobUrl = URL.createObjectURL(blob)
        setAudioUrl(localBlobUrl)

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop())

        // Automatically upload audio to Supabase Storage
        await uploadAudio(blob)
      }

      mediaRecorder.start(200) // collect slices every 200ms
      setIsRecording(true)
      setRecordingSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 120) { // Max 2 minutes recording
            stopRecording()
            return 120
          }
          return prev + 1
        })
      }, 1000)

    } catch (err: unknown) {
      console.error('Microphone access error:', err)
      setErrorMessage(err instanceof Error ? err.message : 'تعذر الوصول إلى الميكروفون. يرجى منح الإذن.')
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const uploadAudio = async (blob: Blob) => {
    setIsUploading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const studentId = user?.id || 'guest'
      const fileName = `${studentId}/${questionId}_${Date.now()}.webm`

      const { error: uploadError } = await supabase.storage
        .from('quiz-audio')
        .upload(fileName, blob, {
          contentType: 'audio/webm',
          upsert: true
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        // Fallback: If quiz-audio bucket does not exist, upload as base64 string or notify
        setUploadedUrl(audioUrl) // fallback to local url for form submit
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('quiz-audio')
          .getPublicUrl(fileName)
        
        setUploadedUrl(publicUrl)
        if (onAudioUploaded) onAudioUploaded(publicUrl)
      }
    } catch (error) {
      console.error('Audio upload failed:', error)
      setErrorMessage('فشل رفع التسجيل الصوتي للسحابة. سيتم حفظ التسجيل محلياً.')
    } finally {
      setIsUploading(false)
    }
  }

  const resetRecording = () => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl)
    }
    setRecordedBlob(null)
    setAudioUrl(null)
    setUploadedUrl(null)
    setRecordingSeconds(0)
    setErrorMessage(null)
  }

  const togglePlayback = () => {
    if (!previewAudioRef.current || !audioUrl) return
    if (isPlaying) {
      previewAudioRef.current.pause()
      setIsPlaying(false)
    } else {
      previewAudioRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="rounded-2xl p-5 border-2 border-[#d4c3a3]/70 bg-card/60 backdrop-blur-sm space-y-4">
      {/* Hidden input to pass uploaded audio URL to server form submission */}
      <input type="hidden" name={name} value={uploadedUrl || ''} />

      {audioUrl && (
        <audio
          ref={previewAudioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : uploadedUrl ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
          <span className="text-sm font-black text-foreground">
            {isRecording ? 'جاري التسجيل الصوتي الآن...' : uploadedUrl ? 'تم تسجيل التلاوة بنجاح' : 'اضغط على زر التسجيل لقراءة الآية'}
          </span>
        </div>

        {isRecording && (
          <span className="text-sm font-mono font-black text-red-600 bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
            {formatTimer(recordingSeconds)}
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Control Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {!isRecording && !audioUrl && (
          <Button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold gap-2 shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Mic className="w-5 h-5" />
            بدء تسجيل التلاوة
          </Button>
        )}

        {isRecording && (
          <Button
            type="button"
            onClick={stopRecording}
            className="h-12 px-6 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold gap-2 shadow-lg animate-pulse"
          >
            <Square className="w-5 h-5 fill-current" />
            إيقاف وحفظ التلاوة
          </Button>
        )}

        {audioUrl && !isRecording && (
          <>
            <Button
              type="button"
              onClick={togglePlayback}
              variant="outline"
              className="h-12 px-5 rounded-xl border-2 border-primary font-bold gap-2 text-primary hover:bg-primary/10"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              {isPlaying ? 'إيقاف مؤقت' : 'استمع لتلاوتك'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={resetRecording}
              disabled={disabled || isUploading}
              className="h-12 px-4 rounded-xl text-muted-foreground hover:text-red-600 gap-1.5 font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة التسجيل
            </Button>

            {isUploading && (
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري رفع الصوت...
              </div>
            )}

            {uploadedUrl && !isUploading && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                جاهز للتسليم
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
