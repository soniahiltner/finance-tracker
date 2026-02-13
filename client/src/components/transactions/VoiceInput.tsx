import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

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
  onstart: (() => void) | null
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
  availableCategories?: Array<{ _id: string; name: string; type: string }>
}

export const VoiceInput = ({
  onTranscriptProcessed,
  availableCategories = []
}: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)

  const { t, language } = useTranslation()
  const recognitionLanguage = language === 'en' ? 'en-US' : 'es-ES'

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const processingRef = useRef(false)

  const processTranscript = useCallback(
    async (text: string) => {
      // Evitar procesamiento duplicado
      if (processingRef.current) return
      processingRef.current = true

      setIsProcessing(true)
      setError('')

      try {
        const lowerText = text.toLowerCase()

        // Detectar tipo
        const type =
          lowerText.includes('ingreso') ||
          lowerText.includes('cobré') ||
          lowerText.includes('nómina') ||
          lowerText.includes('income') ||
          lowerText.includes('salary') ||
          lowerText.includes('payroll') ||
          lowerText.includes('paycheck') ||
          lowerText.includes('earned') ||
          lowerText.includes('received')
            ? 'income'
            : 'expense'

        // Extraer cantidad (buscar números)
        const amountMatch = text.match(
          /(\d+(?:[.,]\d+)?)\s*(?:euros?|€|dollars?|usd|\$)?/
        )
        const amount = amountMatch
          ? parseFloat(amountMatch[1].replace(',', '.'))
          : 0

        // Extraer fecha
        const today = new Date().toISOString().split('T')[0]
        let date = today
        if (lowerText.includes('ayer') || lowerText.includes('yesterday')) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          date = yesterday.toISOString().split('T')[0]
        }

        // Función para encontrar la categoría más probable
        const findCategory = (): string => {
          // Palabras clave en español para cada tipo de categoría inglesa
          const categoryKeywords: Record<string, string[]> = {
            'Food & Dining': [
              'supermercado',
              'comida',
              'alimentación',
              'compra',
              'mercado',
              'carrefour',
              'aldi',
              'frutas',
              'verduras',
              'pan',
              'leche',
              'carne',
              'groceries',
              'food'
            ],
            Shopping: [
              'compra',
              'tienda',
              'ropa',
              'zapatos',
              'zara',
              'h&m',
              'adidas',
              'nike',
              'shopping',
              'clothes'
            ],
            Transport: [
              'gasolina',
              'combustible',
              'gasolinera',
              'carburante',
              'diesel',
              'metro',
              'transporte',
              'taxi',
              'uber',
              'autobús',
              'tren',
              'carretera',
              'fuel',
              'car'
            ],
            Salary: [
              'nómina',
              'salario',
              'sueldo',
              'paga',
              'ingreso',
              'cobré',
              'salary',
              'wage'
            ],
            'Bills & Utilities': [
              'factura',
              'luz',
              'agua',
              'gas',
              'teléfono',
              'electricidad',
              'servicios',
              'utilities',
              'bills'
            ],
            Entertainment: [
              'cine',
              'película',
              'teatro',
              'entrada',
              'concierto',
              'entretenimiento',
              'películas',
              'cines',
              'movies',
              'entertainment'
            ],
            Healthcare: [
              'médico',
              'medicina',
              'farmacia',
              'doctor',
              'hospital',
              'salud',
              'health',
              'medical'
            ],
            Education: [
              'estudio',
              'educación',
              'escuela',
              'libro',
              'curso',
              'clase',
              'education',
              'school'
            ],
            Investments: [
              'inversión',
              'bolsa',
              'acciones',
              'investment',
              'stock'
            ],
            Freelance: ['freelance', 'trabajo', 'proyecto']
          }

          // Buscar en las categorías disponibles
          for (const cat of availableCategories) {
            const catLowerName = cat.name.toLowerCase()
            const keywords = categoryKeywords[cat.name] || []

            // Si encontramos una palabra clave
            for (const keyword of keywords) {
              if (lowerText.includes(keyword)) {
                return cat.name
              }
            }

            // Si el nombre de la categoría aparece en el texto
            if (lowerText.includes(catLowerName)) {
              return cat.name
            }
          }

          // Si no encontramos categoría, intentar devolver "Other" (expenses u income según el tipo)
          const otherCategory = availableCategories.find(
            (cat) =>
              cat.name.toLowerCase().includes('other') && cat.type === type
          )
          if (otherCategory) return otherCategory.name

          // Si aún no hay, devolver la primera disponible del tipo correcto
          const sameTypeCategory = availableCategories.find(
            (cat) => cat.type === type
          )
          return (
            sameTypeCategory?.name ||
            (availableCategories.length > 0
              ? availableCategories[0].name
              : 'Other')
          )
        }

        const category = findCategory()

        onTranscriptProcessed({
          type,
          amount,
          description: text,
          category,
          date
        })
      } catch (err) {
        console.error('Error processing transcript:', err)
        setError(t.errorProcessingTranscription)
      } finally {
        setIsProcessing(false)
        processingRef.current = false
      }
    },
    [onTranscriptProcessed, availableCategories, t]
  )

  // Inicializar el reconocimiento de voz
  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      setIsSupported(false)
      return
    }

    try {
      setIsSupported(true)
      const recognition = new SpeechRecognitionAPI()

      recognition.lang = recognitionLanguage
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      let finalTranscript = ''
      let interimTranscript = ''

      recognition.onstart = () => {
        setError('')
        setTranscript('')
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Procesar todos los resultados
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript

          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + ' '
          } else {
            interimTranscript += transcriptPart
          }
        }

        // Mostrar el resultado provisional o final
        const currentTranscript = finalTranscript || interimTranscript
        setTranscript(currentTranscript)

        // Solo procesar cuando hay un resultado final
        if (finalTranscript) {
          processTranscript(finalTranscript.trim())
          finalTranscript = ''
          interimTranscript = ''
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Ignorar el error 'aborted' que ocurre cuando se para la grabación normalmente
        if (event.error === 'aborted') {
          return
        }

        console.error('Speech recognition error:', event.error)

        switch (event.error) {
          case 'no-speech':
            setError(t.waitingForVoiceInput)
            // No detener la grabación, solo mostrar un mensaje
            break
          case 'audio-capture':
            setError(t.microphoneAccessError)
            setIsRecording(false)
            break
          case 'not-allowed':
            setError(t.microphonePermissionDenied)
            setIsRecording(false)
            break
          default:
            setError(`${t.recognitionErrorPrefix}: ${event.error}`)
            setIsRecording(false)
        }
      }

      recognition.onend = () => {
        // Si aún queremos grabar y existe la referencia, reiniciar automáticamente
        const isStillRecording = (window as unknown as Record<string, unknown>)
          .__isRecordingActive
        if (isStillRecording && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch {
            console.log('Recognition already started or other state issue')
            ;(
              window as unknown as Record<string, unknown>
            ).__isRecordingActive = false
          }
        } else {
          // Si no queremos seguir grabando, actualizar el estado
          setIsRecording(false)
        }
      }

      recognitionRef.current = recognition
    } catch (err) {
      console.error('Error initializing speech recognition:', err)
      setIsSupported(false)
    }

    return () => {
      // Limpiar cuando el componente se desmonta
      ;(window as unknown as Record<string, unknown>).__isRecordingActive =
        false
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (err) {
          console.log('Error during cleanup:', err)
        }
      }
    }
  }, [
    processTranscript,
    recognitionLanguage,
    t.microphoneAccessError,
    t.microphonePermissionDenied,
    t.recognitionErrorPrefix,
    t.waitingForVoiceInput
  ])

  const startRecording = () => {
    if (!isSupported || !recognitionRef.current) return

    setError('')
    setTranscript('')
    setIsRecording(true)
    processingRef.current = false
    // Flag global para que onend sepa que debe reiniciar
    ;(window as unknown as Record<string, unknown>).__isRecordingActive = true

    try {
      recognitionRef.current.start()
    } catch (err) {
      console.error('Error starting recognition:', err)
      setError(t.errorStartingVoiceRecognition)
      setIsRecording(false)
      ;(window as unknown as Record<string, unknown>).__isRecordingActive =
        false
    }
  }

  const stopRecording = () => {
    ;(window as unknown as Record<string, unknown>).__isRecordingActive = false
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.log('Error stopping recognition:', err)
      }
    }
    setIsRecording(false)
  }

  // Limpiar cuando se para la grabación
  useEffect(() => {
    if (!isRecording) {
      ;(window as unknown as Record<string, unknown>).__isRecordingActive =
        false
    }
  }, [isRecording])

  // Limpiar cuando el componente se desmonta
  useEffect(() => {
    return () => {
      ;(window as unknown as Record<string, unknown>).__isRecordingActive =
        false
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (err) {
          console.log('Error cleaning up recognition:', err)
        }
      }
    }
  }, [])

  if (!isSupported) {
    return (
      <div className='flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm'>
        <AlertCircle size={16} />
        <span>{t.unsupportedVoiceRecognition}</span>
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
            title={t.recordVoiceInput}
          >
            <Mic size={20} />
            <span>{t.speakNow}</span>
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className='flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors animate-pulse'
          >
            <Square size={20} />
            <span>{t.stop}</span>
          </button>
        )}

        {isProcessing && (
          <div className='flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg'>
            <Loader2
              className='animate-spin'
              size={20}
            />
            <span>{t.processingVoiceInput}</span>
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
          <span className='text-sm'>{t.listening}</span>
        </div>
      )}

      {transcript && !isProcessing && (
        <div className='p-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg'>
          <p className='text-sm font-medium mb-1'>{t.transcription}:</p>
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
        <p>💡 {t.examplesOfWhatYouCanSay}:</p>
        <ul className='list-disc list-inside space-y-0.5 ml-2'>
          <li>"{t.iSpent50EurosAtTheSupermarketToday}"</li>
          <li>"{t.incomeOf1200EurosFromPayroll}"</li>
          <li>"{t.purchaseOf25EurosAtARestaurantYesterday}"</li>
          <li>"{t.paymentOf80EurosInGasoline}"</li>
        </ul>
      </div>
    </div>
  )
}
