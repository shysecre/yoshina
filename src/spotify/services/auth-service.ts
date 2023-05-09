import chalk from 'chalk'
import { readJsonFile, writeJsonFile } from '../../utils/read-write-file'
import { SpotifyClient } from '../spotify-client'
import { object, string, number } from 'zod'
import { Log } from '../../utils/log'

export class SpotifyAuthService {
  public expireDate?: number

  private spotifyClient: SpotifyClient

  constructor(client: SpotifyClient) {
    this.spotifyClient = client

    this.bootstrap()

    Log('Spotify', 'Auth Service started')
  }

  public async authWithCode(code: string) {
    Log('Spotify', 'Authorazing with code')

    try {
      const { body } = await this.spotifyClient.api.authorizationCodeGrant(code)

      await this.updateCreds(body)

      Log('Spotify', 'Authorized with code successfuly')
    } catch (err) {
      console.log(err)
    }
  }

  private async bootstrap() {
    const jsonFile = await readJsonFile<{
      accessToken: string
      refreshToken: string
      expireDate: number
    }>({
      path: './data/spotify-creds.json',
      schema: object({
        accessToken: string(),
        refreshToken: string(),
        expireDate: number(),
      }),
    })

    if (!jsonFile) return this.getAuthUrl()

    const { accessToken, refreshToken, expireDate } = jsonFile

    this.spotifyClient.api.setAccessToken(accessToken)
    this.spotifyClient.api.setRefreshToken(refreshToken)

    await this.setExpireDate(expireDate).checkIsTokenExpired()
  }

  private getAuthUrl() {
    const { api, app } = this.spotifyClient

    const authUrl = api.createAuthorizeURL(
      ['user-read-playback-state', 'user-modify-playback-state'],
      'NO-STATE'
    )

    Log(
      'Spotify',
      `You need to authorize first!\nUse this url:\n${chalk.cyanBright(
        authUrl
      )}`
    )

    app.authServer.startServer()
  }

  private setExpireDate(expireDate: number) {
    this.expireDate = expireDate

    return this
  }

  private async refreshToken() {
    Log('Spotify', 'Refreshing credentionals')

    try {
      const { body } = await this.spotifyClient.api.refreshAccessToken()

      await this.updateCreds(body)

      Log('Spotify', 'Refreshing credentionals done')
    } catch (err) {
      console.log(err)
    }
  }

  public async checkIsTokenExpired() {
    if (!this.expireDate) return
    if (this.expireDate > Date.now()) return

    Log('Spotify', 'Access token expired')

    await this.refreshToken()
  }

  private updateCreds({
    access_token,
    refresh_token,
    expires_in,
  }: {
    access_token: string
    refresh_token?: string
    expires_in: number
  }) {
    return new Promise((resolve) => {
      if (!refresh_token) {
        refresh_token = this.spotifyClient.api.getRefreshToken()
      }

      this.spotifyClient.api.setAccessToken(access_token)
      this.spotifyClient.api.setRefreshToken(refresh_token!)

      const expireDate = Date.now() + expires_in * 1000

      this.expireDate = expireDate

      writeJsonFile({
        path: './data/spotify-creds.json',
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expireDate,
        },
      })

      resolve(true)
    })
  }
}
