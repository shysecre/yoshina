import chalk from 'chalk'
import { ZodIssue } from 'zod'

const checkForRequired = (message: string) => {
  return message === 'Required'
}

const formError = ({ path, message, code }: ZodIssue) => {
  const colors = {
    fieldColor: chalk.red,
    reqTrue: chalk.green,
    reqFalse: chalk.red,
    codeColor: chalk.yellowBright,
  }

  const field = colors.fieldColor(path[0])
  const isRequired = checkForRequired(message)
    ? colors.reqTrue('true')
    : colors.reqFalse('false')

  const codeStr = colors.codeColor(code)

  return `Field: ${field}, isRequired: ${isRequired}, code: ${codeStr}`
}

export const formErrors = (issues: ZodIssue[]) => {
  const forHumans = issues.map(formError).join('\n')

  console.log(
    `Something wrong with your .env file! Please check message below\n\n` +
      forHumans
  )
}
