'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Gauge } from 'lucide-react'
import { RECITERS, getSurahByNumber } from '@/lib/quran-audio'

interface QuranAudioPlayerProps {
  audioUrl?: string
  surahNumber?: number
  ayahNumber?: number
  reciterId?: string
  title?: string
  autoPlay?: boolean
}

export function QuranAudioPlayer({
  audioUrl,
  surahNumber,
  ayahNumber,
  reciterId,
  title,
  autoPlay = false
}: QuranAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [isMuted, setIsMuted] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const surah = surahNumber ? getSurahByNumber(surahNumber) : null
  const reciter = reciterId ? RECITERS.find(r => r.id === reciterId) : null

  // Determine final audio src
  const src = audioUrl || ''

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (!isLooping) setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isLooping])

  const togglePlay = () => {
    if (!audioRef.current || !src) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = target
      setCurrentTime(target)
    }
  }

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
    }
  }

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1.0, 1.25]
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length
    const nextRate = rates[nextIndex]
    setPlaybackRate(nextRate)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (!src) return null

  return (
    <div className="rounded-2xl p-4 sm:p-5 border-2 border-[#d4c3a3]/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-md space-y-3">
      <audio
        ref={audioRef}
        src={src}
        loop={isLooping}
        autoPlay={autoPlay}
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-foreground block">
              {title || (surah ? `سورة ${surah.nameAr} - آية ${ayahNumber}` : 'تلاوة صوتية للاستماع')}
            </span>
            {reciter && (
              <span className="text-[11px] text-muted-foreground font-semibold">
                بصوت: {reciter.nameAr}
              </span>
            )}
          </div>
        </div>

        {/* Speed & Loop Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cyclePlaybackRate}
            className="h-7 px-2 text-[11px] font-bold border-[#d4c3a3] gap-1 hover:bg-primary/10"
            title="سرعة التلاوة"
          >
            <Gauge className="w-3 h-3" />
            {playbackRate}x
          </Button>

          <Button
            type="button"
            variant={isLooping ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsLooping(!isLooping)}
            className={`h-7 px-2 text-[11px] font-bold border-[#d4c3a3] gap-1 ${isLooping ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
            title="تكرار الآية"
          >
            <RotateCcw className="w-3 h-3" />
            تكرار
          </Button>
        </div>
      </div>

      {/* Main Playback Bar */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <Button
          type="button"
          onClick={togglePlay}
          size="icon"
          className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform shrink-0"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-[-1px]" />}
        </Button>

        {/* Progress Bar & Timers */}
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground font-bold">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mute Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="w-8 h-8 text-muted-foreground hover:text-foreground shrink-0"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
