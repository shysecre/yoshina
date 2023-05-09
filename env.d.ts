export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TWITCH_CHANNEL?: string
      TWITCH_CLIENT_ID?: string
      TWITCH_CLIENT_SECRET?: string
      TWITCH_REDIRECT_URL?: string
      AUTH_SERVER_PORT?: string
      SPOTIFY_SECRET?: string
      SPOTIFY_CLIENT_ID?: string
      SPOTIFY_REDIRECT_URL?: string
    }
  }
}
