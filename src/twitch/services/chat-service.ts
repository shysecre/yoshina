import { ChatClient } from '@twurple/chat'
import { TwitchClient } from '../twitch-client'
import { Log } from '../../utils/log'

export class TwitchChatService {
  public twitchClient: TwitchClient
  public chat: ChatClient

  constructor(client: TwitchClient) {
    this.twitchClient = client

    this.chat = new ChatClient({
      authProvider: this.twitchClient.authService.authProvider,
      channels: [process.env.TWITCH_CHANNEL!],
    })

    this.chat.connect()

    Log('Twitch', 'Chat Client started')
  }
}
