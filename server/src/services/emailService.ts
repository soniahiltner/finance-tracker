import nodemailer from 'nodemailer'
import logger from '../config/logger.js'

const getTransporter = () => {
  const host = process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io'
  const port = Number(process.env.MAILTRAP_PORT || 2525)
  const user = process.env.MAILTRAP_USER
  const pass = process.env.MAILTRAP_PASS

  if (!user || !pass) {
    throw new Error(
      'Configuración de Mailtrap incompleta: MAILTRAP_USER y MAILTRAP_PASS son requeridos.'
    )
  }

  return nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass
    }
  })
}

export const sendPasswordResetEmail = async (params: {
  to: string
  name: string
  resetUrl: string
}) => {
  const { to, name, resetUrl } = params
  const from =
    process.env.EMAIL_FROM || 'Finance Tracker <no-reply@finance-tracker.com>'

  const subject = 'Recuperación de contraseña'
  const text = `Hola ${name},\n\nRecibimos una solicitud para restablecer tu contraseña.\nUsa este enlace para crear una nueva contraseña:\n${resetUrl}\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\nGracias,\nFinance Tracker`

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Recuperación de contraseña</h2>
      <p>Hola ${name},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Crear nueva contraseña</a>
      </p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      <p style="margin-top:24px;">Gracias,<br/>Finance Tracker</p>
    </div>
  `

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    })
  } catch (error) {
    logger.error('Error enviando email de reset de contraseña:', error)
    throw error
  }
}
