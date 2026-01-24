import multer from 'multer'
import path from 'path'

// Configurar almacenamiento en memoria (no guardar en disco)
const storage = multer.memoryStorage()

// Filtro de archivos permitidos
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]

  const allowedExtensions = [
    '.pdf',
    '.xls',
    '.xlsx',
    '.csv',
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif'
  ]

  const ext = path.extname(file.originalname).toLowerCase()

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(ext)
  ) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Tipo de archivo no permitido. Use PDF, Excel, CSV o imágenes (JPG, PNG, WEBP, GIF)'
      )
    )
  }
}

// Configurar multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB máximo
  }
})

// Middleware para manejar errores de multer
export const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Tamaño máximo: 10 MB'
      })
    }
    return res.status(400).json({
      success: false,
      message: `Error al subir archivo: ${err.message}`
    })
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Error al procesar el archivo'
    })
  }

  next()
}
