import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react'

// Declaraciones de tipos para Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

interface VoiceInputProps {
  onTranscriptProcessed: (data: {
    type: 'income' | 'expense'
    amount: number
    description: string
    category: string
    date: string
  }) => void
}

export const VoiceInput = ({ onTranscriptProcessed }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [transcript, setTranscript] = useState('')

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const processTranscript = async (text: string) => {
    setIsProcessing(true)
    setError('')

    try {
      // Aquí iría la lógica para procesar el texto y extraer la información
      // Por ahora, un ejemplo básico
      const lowerText = text.toLowerCase()
      
      // Detectar tipo
      const type = lowerText.includes('ingreso') || lowerText.includes('cobré') || lowerText.includes('nómina') 
        ? 'income' 
        : 'expense'

      // Extraer cantidad (buscar números)
      const amountMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:euros?|€)?/)
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0

      // Extraer fecha
      const today = new Date().toISOString().split('T')[0]
      let date = today
      if (lowerText.includes('ayer')) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        date = yesterday.toISOString().split('T')[0]
      }

      // Categoría básica
      let category = 'Otros'
      if (lowerText.includes('supermercado') || lowerText.includes('comida')) category = 'Alimentación'
      if (lowerText.includes('restaurante')) category = 'Restaurantes'
      if (lowerText.includes('gasolina') || lowerText.includes('combustible')) category = 'Transporte'
      if (lowerText.includes('nómina') || lowerText.includes('salario')) category = 'Salario'

      onTranscriptProcessed({
        type,
        amount,
        description: text,
        category,
        date
      })
    } catch (err) {
      console.error('Error processing transcript:', err)
      setError('Error al procesar la transcripción')
    } finally {
      setIsProcessing(false)
    }
  }

  // Verificar si el navegador soporta Web Speech API
  const SpeechRecognition =
    (
      window as Window & {
        SpeechRecognition?: typeof window.SpeechRecognition
        webkitSpeechRecognition?: typeof window.SpeechRecognition
      }
    ).SpeechRecognition ||
    (
      window as Window & {
        SpeechRecognition?: typeof window.SpeechRecognition
        webkitSpeechRecognition?: typeof window.SpeechRecognition
      }
    ).webkitSpeechRecognition

  const isSupported = !!SpeechRecognition

  useEffect(() => {
    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcriptText = event.results[0][0].transcript
      setTranscript(transcriptText)
      processTranscript(transcriptText)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)

      switch (event.error) {
        case 'no-speech':
          setError('No se detectó voz. Intenta de nuevo.')
          break
        case 'audio-capture':
          setError('No se puede acceder al micrófono. Verifica los permisos.')
          break
        case 'not-allowed':
          setError('Permiso de micrófono denegado.')
          break
        default:
          setError(`Error de reconocimiento: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [SpeechRecognition])

  const startRecording = () => {
    if (!isSupported || !recognitionRef.current) return

    setError('')
    setTranscript('')
    setIsRecording(true)

    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error('Error starting recognition:', err)
      setError('Error al iniciar el reconocimiento de voz')
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
  }

  if (!isSupported) {
    return (
      <div className='flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm'>
        <AlertCircle size={16} />
        <span>
          Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.
        </span>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-3'>
        {!isRecording && !isProcessing && (
          <button
            onClick={startRecording}
            className='flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
            title='Grabar entrada por voz'
          >
            <Mic size={20} />
            <span>Hablar</span>
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className='flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors animate-pulse'
          >
            <Square size={20} />
            <span>Detener</span>
          </button>
        )}

        {isProcessing && (
          <div className='flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg'>
            <Loader2
              className='animate-spin'
              size={20}
            />
            <span>Procesando...</span>
          </div>
        )}
      </div>

      {isRecording && (
        <div className='flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg'>
          <div className='flex gap-1'>
            <div className='w-1 h-4 bg-blue-600 dark:bg-blue-400 animate-pulse rounded'></div>
            <div
              className='w-1 h-4 bg-blue-600 dark:bg-blue-400 animate-pulse rounded'
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className='w-1 h-4 bg-blue-600 dark:bg-blue-400 animate-pulse rounded'
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
          <span className='text-sm'>Escuchando...</span>
        </div>
      )}

      {transcript && !isProcessing && (
        <div className='p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg'>
          <p className='text-sm font-medium mb-1'>Transcripción:</p>
          <p className='text-sm italic'>"{transcript}"</p>
        </div>
      )}

      {error && (
        <div className='flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg'>
          <AlertCircle size={16} />
          <span className='text-sm'>{error}</span>
        </div>
      )}

      <div className='text-xs text-gray-500 dark:text-gray-400 space-y-1'>
        <p>💡 Ejemplos de lo que puedes decir:</p>
        <ul className='list-disc list-inside space-y-0.5 ml-2'>
          <li>"Gasté 50 euros en el supermercado hoy"</li>
          <li>"Ingreso de 1200 euros de nómina"</li>
          <li>"Compra de 25 euros en restaurante ayer"</li>
          <li>"Pago de 80 euros en gasolina"</li>
        </ul>
      </div>
    </div>
  )
}
