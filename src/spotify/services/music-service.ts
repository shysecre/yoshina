import {
  HandleSongRequestOptions,
  PlaySongReturn,
} from '../../types/spotify.types'
import { Log } from '../../utils/log'
import { getTrackIdFromLink } from '../../utils/parse-track'
import { SpotifyClient } from '../spotify-client'
import { RequestQueueElement } from '../types'

export class SpotifyMusicService {
  public spotifyClient: SpotifyClient

  constructor(client: SpotifyClient) {
    this.spotifyClient = client

    Log('Spotify', 'Music Service started')

    this.bootstrap()
  }

  public bootstrap() {
    setInterval(async () => {
      if (!this.spotifyClient.requestsQueue.size) return

      const data: RequestQueueElement = this.spotifyClient.requestsQueue
        .values()
        .next().value

      this.spotifyClient.requestsQueue.delete(data)

      const userId = this.spotifyClient.app.twitchClient.user!.id
      const customRewardId = this.spotifyClient.app.twitchClient.customRewardId!

      try {
        await this.handleSongRequest({
          user: data.username,
          link: data.message,
        })

        this.spotifyClient.app.twitchClient.apiService.api.channelPoints.updateRedemptionStatusByIds(
          userId,
          customRewardId,
          [data.redeemId],
          'FULFILLED'
        )
      } catch (err) {
        this.spotifyClient.app.twitchClient.chatService.chat.say(
          this.spotifyClient.app.twitchClient.user!.name,
          `@${data.username} error appear, I will refund you points BlessRNG `
        )

        this.spotifyClient.app.twitchClient.apiService.api.channelPoints.updateRedemptionStatusByIds(
          userId,
          customRewardId,
          [data.redeemId],
          'CANCELED'
        )
      }
    }, 1000)
  }

  public handleSongRequest({ user, link }: HandleSongRequestOptions) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.spotifyClient.authService.checkIsTokenExpired()

        const channel = this.spotifyClient.app.twitchClient.user?.name

        if (!channel) return reject()

        const { isQueue, song } = await this.playSong.bind(this)(link)

        const artists = song.artists.map((artist) => artist.name).join(', ')

        Log('Twitch', `"${artists} - ${song.name}" was requested by ${user}`)

        if (isQueue) {
          this.spotifyClient.app.twitchClient.chatService.chat.say(
            channel,
            `${user} track "${artists} - ${song.name}" added to the queue`
          )

          resolve(true)
        } else {
          this.spotifyClient.app.twitchClient.chatService.chat.say(
            channel,
            `${user} track "${artists} - ${song.name}" will start playing soon`
          )

          resolve(true)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  private playSong(link: string) {
    return new Promise<PlaySongReturn>(async (resolve, reject) => {
      try {
        const devicesResponse = await this.spotifyClient.api.getMyDevices()

        if (!devicesResponse.body.devices.length) return reject()

        const trackId = getTrackIdFromLink(link)
        const trackResponse = await this.spotifyClient.api.getTrack(trackId!)

        let isQueue = false

        if (!trackResponse.body) return reject()

        const isPlaying = await this.checkIsPlaying()

        switch (isPlaying) {
          case true:
            await this.spotifyClient.api.addToQueue(
              this.createTrackUri(trackResponse.body.id)
            )

            isQueue = true
            break
          case false:
            await this.spotifyClient.api.play({
              uris: [this.createTrackUri(trackResponse.body.id)],
            })
            break
        }

        resolve({ isQueue, song: trackResponse.body })
      } catch (err) {
        console.log(err)

        reject(err)
      }
    })
  }

  private async checkIsPlaying() {
    const currentPlayingResponse =
      await this.spotifyClient.api.getMyCurrentPlayingTrack()

    switch (currentPlayingResponse.body.currently_playing_type) {
      case 'ad':
        return true
      case 'episode':
        return true
      case 'track':
        if (
          (currentPlayingResponse.body.is_playing === false &&
            (currentPlayingResponse.body.progress_ms || 0) > 0) ||
          currentPlayingResponse.body.is_playing
        ) {
          return true
        }

        return false
      case 'unknown':
        return false
    }
  }

  private createTrackUri(trackId: string) {
    return `spotify:track:${trackId}`
  }
}
