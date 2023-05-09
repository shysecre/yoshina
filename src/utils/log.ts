export const Log = (prefix: string, msg: string) => {
  console.log(`[${new Date().toLocaleString()} ${prefix}] ${msg}`)
}
