import fetcher from './fetcher'

export const getStockWaveReal = async (value: object) => {
  try {
    const response = await fetcher.post(`service/data/getStockWaveReal`, value)
    // return response.data
    console.log(`response:: `, response)
  } catch (error: any) {
    console.log(error)
  }
}
