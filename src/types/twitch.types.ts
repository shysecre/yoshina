export interface TwitchCreds {
  accessToken: string
  refreshToken: string
  expireDate: number
}

export interface TwitchSettings {
  customRewardId: string
}

export interface OnRedeemOptions {
  userName: string
  redemptionId: string
  message: string
}
