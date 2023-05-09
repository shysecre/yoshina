import SpotifyWebApiClient from 'spotify-web-api-node'
import { App } from '../app'
import { SpotifyAuthService } from './services/auth-service'
import { SpotifyMusicService } from './services/music-service'
import { Log } from '../utils/log'
import { RequestQueueElement } from '../types/spotify.types'

export class SpotifyClient {
  public app: App
  public api = new SpotifyWebApiClient({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URL,
  })

  public musicService: SpotifyMusicService
  public authService: SpotifyAuthService

  public requestsQueue: Set<RequestQueueElement> = new Set()

  constructor(app: App) {
    this.app = app

    this.authService = new SpotifyAuthService(this)
    this.musicService = new SpotifyMusicService(this)

    Log('Spotify', 'Spotify Client started')
  }
}
