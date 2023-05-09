import { ApiClient } from '@twurple/api'
import { TwitchClient } from '../twitch-client'
import { readJsonFile, writeJsonFile } from '../../utils/read-write-file'
import chalk from 'chalk'
import { Log } from '../../utils/log'
import { TwitchSettings } from '../../types/twitch.types'

export class TwitchApiService {
  public twitchClient: TwitchClient
  public api: ApiClient

  private turningOff: boolean = false

  constructor(client: TwitchClient) {
    this.twitchClient = client

    this.api = new ApiClient({
      authProvider: this.twitchClient.authService.authProvider,
    })

    Log('Twitch', 'Api Client started')

    this.bootstrap()

    process.on('SIGINT', this.turnOffReward.bind(this))
    process.on('SIGTERM', this.turnOffReward.bind(this))
    process.on('SIGQUIT', this.turnOffReward.bind(this))
  }

  public async bootstrap() {
    const user = await this.api.users.getUserByName(process.env.TWITCH_CHANNEL!)

    if (!user) {
      Log('Twitch', 'Cannot fetch initial user data, exiting...')

      process.exit(1)
    }

    this.twitchClient.user = user

    const jsonFile = await readJsonFile<TwitchSettings>({
      path: `./data/twitch-settings.json`,
    })

    if (!jsonFile) {
      return this.createInitialCustomReward()
    }

    this.twitchClient.customRewardId = jsonFile.customRewardId

    this.checkIfInitialCustomRewardExist()
    this.turnOnReward()
  }

  public async createInitialCustomReward() {
    try {
      if (!this.twitchClient.user) {
        Log(
          'Twitch',
          'Cannot create initial custom reward, because no user object was found'
        )

        process.exit(1)
      }

      const createdCustomReward =
        await this.api.channelPoints.createCustomReward(
          this.twitchClient.user.id,
          {
            cost: 500,
            title: 'Spotify Song Request',
            backgroundColor: '#030303',
            isEnabled: true,
            userInputRequired: true,
            prompt: 'Please provide link to spotify song',
          }
        )

      writeJsonFile({
        path: './data/twitch-settings.json',
        data: {
          customRewardId: createdCustomReward.id,
        },
      })

      this.twitchClient.customRewardId = createdCustomReward.id

      const link = `https://dashboard.twitch.tv/u/${process.env.TWITCH_CHANNEL}/viewer-rewards/channel-points/rewards`
      const coloredLink = chalk.cyanBright(link)

      Log(
        'Twitch',
        `Initial custom reward created\nIf you need to update it, visit:\n${coloredLink}`
      )

      this.checkIfInitialCustomRewardExist()
    } catch (err) {
      console.log(err)
      process.exit(1)
    }
  }

  public checkIfInitialCustomRewardExist() {
    Log('Twitch', 'Starting interval to check for reward every 5 minutes')

    this.rewardCheck()

    setInterval(this.rewardCheck.bind(this), 1000 * 5 * 60)
  }

  private async turnOnReward() {
    try {
      if (!this.twitchClient.user || !this.twitchClient.customRewardId) return

      Log('Twitch', 'Enabling custom reward for requests')

      await this.api.channelPoints.updateCustomReward(
        this.twitchClient.user.id,
        this.twitchClient.customRewardId,
        { isEnabled: true }
      )

      Log('Twitch', 'Custom reward enabled, now users can redeem it')
    } catch (err) {
      console.log(err)
    }
  }

  private async turnOffReward() {
    if (this.turningOff) return

    try {
      if (!this.twitchClient.user || !this.twitchClient.customRewardId) return

      Log('Twitch', 'Disabling custom reward')

      this.turningOff = true

      await this.api.channelPoints.updateCustomReward(
        this.twitchClient.user.id,
        this.twitchClient.customRewardId,
        { isEnabled: false }
      )

      process.exit(0)
    } catch (err) {
      console.log(err)
    }
  }

  private async rewardCheck() {
    try {
      if (!this.twitchClient.user || !this.twitchClient.customRewardId) {
        Log(
          'Twitch',
          'Cannot check initial reward for existing because user or custom reward id was not found in twitch cient'
        )

        process.exit(1)
      }

      const reward = await this.api.channelPoints.getCustomRewardById(
        this.twitchClient.user.id,
        this.twitchClient.customRewardId!
      )

      if (!reward) {
        Log(
          'Twitch',
          'Custom reward needed for script to work properly was not found in twitch dashboard'
        )

        process.exit(1)
      }
    } catch (err) {
      console.log(err)
    }
  }
}
