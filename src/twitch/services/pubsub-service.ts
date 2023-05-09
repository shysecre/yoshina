import { PubSubClient, PubSubRedemptionMessage } from '@twurple/pubsub'
import { TwitchClient } from '../twitch-client'
import { Log } from '../../utils/log'

export class TwitchPubSubService {
  public twitchClient: TwitchClient

  public pubsub: PubSubClient

  constructor(client: TwitchClient) {
    this.twitchClient = client

    this.pubsub = new PubSubClient({
      authProvider: this.twitchClient.authService.authProvider,
    })

    Log('Twitch', 'PubSub Client started')

    this.registerHandlers()
  }

  private registerHandlers() {
    if (!this.twitchClient.user) return

    this.pubsub.onRedemption(
      this.twitchClient.user.id,
      this.onMessage.bind(this)
    )
  }

  private onMessage(msg: PubSubRedemptionMessage) {
    if (!this.twitchClient.user || !this.twitchClient.customRewardId) {
      Log(
        'Twitch',
        "Can't handle message because user or custom reward id was not found"
      )

      return
    }

    const { id, userName, rewardId, message } = msg

    if (rewardId !== this.twitchClient.customRewardId) return

    this.twitchClient.app.spotifyClient.requestsQueue.add({
      message,
      username: userName,
      redeemId: id,
    })
  }
}
