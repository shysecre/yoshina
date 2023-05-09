import Express, { Application, Request, Response } from 'express'
import { App } from '../app'
import { RoutesConst } from './constants'

type RunningServer = ReturnType<Application['listen']>

export class AuthServer {
  public app: App

  private express = Express()
  private runningServer?: RunningServer
  private serverStarted?: Date

  private twitchCodeReceived?: Date
  private spotifyCodeReceived?: Date

  private autoCloseHtml = `<html><script>window.close()</script></html>`

  constructor(app: App) {
    this.app = app

    this.express.get(RoutesConst.SPOTI_CODE, this.handleSpotifyCode.bind(this))
    this.express.get(RoutesConst.TWITCH_CODE, this.handleTwitchCode.bind(this))
  }

  public startServer() {
    if (!this.runningServer) {
      this.serverStarted = new Date()
      this.runningServer = this.express.listen(process.env.AUTH_SERVER_PORT)
    }

    setTimeout(() => {
      if (
        this.serverStarted &&
        (!this.twitchCodeReceived || !this.spotifyCodeReceived)
      ) {
        this.killServer()
        process.exit(0)
      }

      if (
        this.serverStarted &&
        (this.twitchCodeReceived || this.spotifyCodeReceived)
      ) {
        this.killServer()
      }

      this.serverStarted = undefined
      this.twitchCodeReceived = undefined
      this.spotifyCodeReceived = undefined
    }, 5 * 1000 * 60)
  }

  private killServer() {
    if (!this.runningServer) return

    this.runningServer.close()
  }

  private handleSpotifyCode(req: Request, res: Response) {
    this.spotifyCodeReceived = new Date()

    res.send(this.autoCloseHtml)

    this.app.spotifyClient.authService.authWithCode(`${req.query.code}`)
  }

  private handleTwitchCode(req: Request, res: Response) {
    this.twitchCodeReceived = new Date()

    res.send(this.autoCloseHtml)

    this.app.twitchClient.getTokensFromCode(`${req.query.code}`)
  }
}
