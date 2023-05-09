import { AuthServer } from './server/server-client'
import { SpotifyClient } from './spotify/spotify-client'
import { TwitchClient } from './twitch/twitch-client'
import './utils/check-env'

export class App {
  public authServer: AuthServer
  public spotifyClient: SpotifyClient
  public twitchClient: TwitchClient

  constructor() {
    this.authServer = new AuthServer(this)
    this.spotifyClient = new SpotifyClient(this)
    this.twitchClient = new TwitchClient(this)
  }

  public bootstrap() {
    this.bootstrapTwitchClient()
  }

  private bootstrapTwitchClient() {
    let intervalId = setInterval(() => {
      if (!this.spotifyClient.authService.expireDate) return

      this.twitchClient.bootstrap()

      clearInterval(intervalId)
    }, 2000)
  }
}

const app = new App()

app.bootstrap()
