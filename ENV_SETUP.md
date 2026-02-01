# Variables de Entorno - Guía de Configuración

## Desarrollo (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
CLIENT_URL=http://localhost:5173
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass
EMAIL_FROM=Finance Tracker <no-reply@finance-tracker.com>
```

## Producción

### Variables Requeridas

| Variable            | Descripción                                        | Ejemplo                                                       |
| ------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| `PORT`              | Puerto del servidor                                | `5000`                                                        |
| `MONGODB_URI`       | URI de conexión a MongoDB                          | `mongodb+srv://user:pass@cluster.mongodb.net/finance-tracker` |
| `JWT_SECRET`        | Clave secreta para JWT (mín. 32 caracteres)        | Generar con: `openssl rand -base64 32`                        |
| `ANTHROPIC_API_KEY` | API key de Anthropic Claude                        | `sk-ant-api03-...`                                            |
| `NODE_ENV`          | Entorno de ejecución                               | `production`                                                  |
| `ALLOWED_ORIGINS`   | Orígenes permitidos para CORS (separados por coma) | `https://tu-app.com,https://www.tu-app.com`                   |
| `CLIENT_URL`        | URL base del frontend (para links de reset)        | `https://tu-app.com`                                          |
| `MAILTRAP_HOST`     | Host SMTP de Mailtrap                              | `sandbox.smtp.mailtrap.io`                                    |
| `MAILTRAP_PORT`     | Puerto SMTP de Mailtrap                            | `2525`                                                        |
| `MAILTRAP_USER`     | Usuario SMTP de Mailtrap                           | `user_123`                                                    |
| `MAILTRAP_PASS`     | Password SMTP de Mailtrap                          | `pass_123`                                                    |
| `EMAIL_FROM`        | Remitente de emails                                | `Finance Tracker <no-reply@finance-tracker.com>`              |

### Seguridad en Producción

1. **NUNCA** commitear el archivo `.env` (debe estar en `.gitignore`)
2. **Usar variables de entorno del proveedor de hosting** (Render, Railway, Heroku, etc.)
3. **JWT_SECRET**: Generar una clave fuerte única para producción
4. **MONGODB_URI**: Usar MongoDB Atlas con IP whitelisting
5. **ALLOWED_ORIGINS**: Incluir SOLO los dominios de tu frontend en producción

### Ejemplo de configuración en Render/Railway

```bash
# En el dashboard del hosting, añadir:
NODE_ENV=production
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/finance-tracker
JWT_SECRET=tu_clave_super_secreta_generada_aleatoriamente_aqui
ANTHROPIC_API_KEY=sk-ant-api03-tu-key-aqui
ALLOWED_ORIGINS=https://tu-app.vercel.app,https://www.tu-app.com
CLIENT_URL=https://tu-app.vercel.app
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=tu_usuario_mailtrap
MAILTRAP_PASS=tu_password_mailtrap
EMAIL_FROM=Finance Tracker <no-reply@finance-tracker.com>
PORT=5000
```

### Generación de JWT_SECRET seguro

```bash
# En Linux/Mac:
openssl rand -base64 32

# En Windows PowerShell:
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))
```

## Frontend (.env)

### Desarrollo

```env
VITE_API_URL=http://localhost:5000/api
```

### Producción

```env
VITE_API_URL=https://tu-api.com/api
```

> **Nota**: Las variables de Vite deben tener el prefijo `VITE_` para ser expuestas al código del cliente.
