import { Requester, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig, Config, InputParameters } from '@chainlink/types'

export const supportedEndpoints = ['crypto', 'tickers']

export const inputParameters: InputParameters = {
  base: ['base', 'from', 'coin'],
  quote: ['quote', 'to', 'market'],
  resultPath: false,
}

interface ResponseSchema {
  data: {
    id: string
    type: string
    attributes: {
      last: number
      open: number
      high: number
      low: number
      vwap: number
      volume: number
      bid: number
      ask: number
      price_before_last: number
    }
  }
}

export const execute: ExecuteWithConfig<Config> = async (request, _, config) => {
  const validator = new Validator(request, inputParameters)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id
  const base = validator.validated.data.base
  const quote = validator.validated.data.quote
  const resultPath = validator.validated.data.resultPath || 'vwap'
  const url = `tickers/${base}_${quote}`

  const options = {
    ...config.api,
    url,
  }

  const response = await Requester.request<ResponseSchema>(options)
  const result = Requester.validateResultNumber(response.data, ['data', 'attributes', resultPath])

  return Requester.success(jobRunID, Requester.withResult(response, result), config.verbose)
}
