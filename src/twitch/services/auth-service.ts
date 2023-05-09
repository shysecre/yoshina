import {
  AccessToken,
  RefreshingAuthProvider,
  exchangeCode,
} from '@twurple/auth'
import { TwitchClient } from '../twitch-client'
import { readJsonFile, writeJsonFile } from '../../utils/read-write-file'
import chalk from 'chalk'
import { object, string, number } from 'zod'
import { Log } from '../../utils/log'
import { TwitchCreds } from '../../types/twitch.types'

export class TwitchAuthService {
  public twitchClient: TwitchClient
  public authProvider: RefreshingAuthProvider

  constructor(client: TwitchClient) {
    this.twitchClient = client

    this.authProvider = new RefreshingAuthProvider({
      clientId: process.env.TWITCH_CLIENT_ID!,
      clientSecret: process.env.TWITCH_CLIENT_SECRET!,
      onRefresh: this.onRefresh,
    })
  }

  public async bootstrap() {
    const jsonFile = await readJsonFile<TwitchCreds>({
      path: './data/twitch-creds.json',
      schema: object({
        accessToken: string(),
        refreshToken: string(),
        expireDate: number(),
      }),
    })

    if (!jsonFile) {
      return this.getAuthUrl()
    }

    const instantRefresh = {
      accessToken: jsonFile.accessToken,
      refreshToken: jsonFile.refreshToken,
      expiresIn: 0,
      obtainmentTimestamp: 0,
    }

    await this.authProvider.addUserForToken(instantRefresh, ['chat'])
  }

  public async getTokensFromCode(code: string) {
    Log('Twitch', 'Authorazing with code')

    const data = await exchangeCode(
      process.env.TWITCH_CLIENT_ID!,
      process.env.TWITCH_CLIENT_SECRET!,
      code,
      process.env.TWITCH_REDIRECT_URL!
    )

    Log('Twitch', 'Authorized with code')

    this.onRefresh('', data)

    this.authProvider.addUserForToken(data, ['chat'])
  }

  public getAuthUrl() {
    const url = 'https://id.twitch.tv/oauth2/authorize'
    const states = [
      'channel:manage:redemptions',
      'channel:read:redemptions',
      'chat:read',
      'chat:edit',
    ]

    const searchParams = new URLSearchParams({
      scope: states.join(' '),
      redirect_uri: process.env.TWITCH_REDIRECT_URL!,
      client_id: process.env.TWITCH_CLIENT_ID!,
      response_type: 'code',
    })

    const link = `${url}?${searchParams}`
    const coloredLink = chalk.cyanBright(link)

    Log('Twitch', `You need to authorize first!Use this url:\n${coloredLink}`)

    this.twitchClient.app.authServer.startServer()
  }

  private onRefresh(
    uid: string,
    { accessToken, refreshToken, expiresIn }: AccessToken
  ) {
    const expireDate = Date.now() + expiresIn! * 1000

    writeJsonFile({
      path: './data/twitch-creds.json',
      data: {
        accessToken,
        refreshToken,
        expireDate,
      },
    })
  }
}
