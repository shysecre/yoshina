export interface HandleSongRequestOptions {
  user: string
  link: string
}

export interface PlaySongReturn {
  isQueue: boolean
  song: SpotifyApi.SingleTrackResponse
}

export interface RequestQueueElement {
  username: string
  message: string
  redeemId: string
}
