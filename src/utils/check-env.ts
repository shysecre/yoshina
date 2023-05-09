import { object, string } from 'zod'

import 'dotenv/config'

import { formErrors } from './form-errors'

export default (() => {
  const envSchema = object({
    TWITCH_CHANNEL: string(),
    TWITCH_CLIENT_ID: string(),
    TWITCH_CLIENT_SECRET: string(),
    TWITCH_REDIRECT_URL: string(),
    AUTH_SERVER_PORT: string(),
    SPOTIFY_SECRET: string(),
    SPOTIFY_CLIENT_ID: string(),
    SPOTIFY_REDIRECT_URL: string(),
  })

  const parseResult = envSchema.safeParse(process.env)

  if (!parseResult.success) {
    const issues = parseResult.error.issues

    formErrors(issues)

    process.exit(1)
  }
})()
