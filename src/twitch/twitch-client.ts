import { App } from '../app'
import { TwitchAuthService } from './services/auth-service'
import { TwitchApiService } from './services/api-service'
import { TwitchChatService } from './services/chat-service'
import { readJsonFile } from '../utils/read-write-file'
import { HelixUser } from '@twurple/api/lib'
import { TwitchPubSubService } from './services/pubsub-service'

export class TwitchClient {
  public app: App
  public authService: TwitchAuthService
  public apiService!: TwitchApiService
  public chatService!: TwitchChatService
  public pubSubService!: TwitchPubSubService

  public customRewardId?: string

  public user?: HelixUser

  constructor(app: App) {
    this.app = app
    this.authService = new TwitchAuthService(this)
  }

  public async bootstrap() {
    try {
      await this.authService.bootstrap()

      this.bootstrapApiService()
      this.bootstrapAllServices()
    } catch (err) {
      console.log(err)
    }
  }

  public bootstrapApiService() {
    let intervalId = setInterval(async () => {
      const file = await readJsonFile({ path: './data/twitch-creds.json' })

      if (!file) return
      if (file && !this.user) {
        this.apiService = new TwitchApiService(this)
        return
      }

      clearInterval(intervalId)
    }, 2500)
  }

  public bootstrapAllServices() {
    let intervalId = setInterval(() => {
      if (!this.user) return

      this.chatService = new TwitchChatService(this)
      this.pubSubService = new TwitchPubSubService(this)

      clearInterval(intervalId)
    }, 1000)
  }

  public getTokensFromCode(code: string) {
    return this.authService.getTokensFromCode(code)
  }
}
