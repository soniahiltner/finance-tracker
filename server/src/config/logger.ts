import winston from 'winston'

const { combine, timestamp, printf, colorize, errors } = winston.format

// Formato personalizado para logs
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`
})

// Crear el logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : combine(colorize(), logFormat)
  ),
  transports: [
    // Console para desarrollo
    new winston.transports.Console({
      stderrLevels: ['error']
    }),

    // Archivos para producción
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
          })
        ]
      : [])
  ],
  // No salir en error
  exitOnError: false
})

export default logger
