/*
  Integration tests for the router.js library
*/

// Global npm libraries
const { Avalanche } = require('avalanche')

// Local libraries
const AdapterRouter = require('../../lib/adapter/router')

describe('#AdapterRouter', () => {
  let uut

  beforeEach(() => {
    const localConfig = {
      ava: new Avalanche('api.avax.network', 443, 'https', 1)
    }

    uut = new AdapterRouter(localConfig)
  })

  describe('#getUTXOs', () => {
    it('should get UTXOs for an address', async () => {
      const addr = 'X-avax17ky3ujmyg8v0l79xknlk9xhd5d53vj55vhw9sx'
      // const addr = '17ky3ujmyg8v0l79xknlk9xhd5d53vj55vhw9sx'
      // const addr = '5FiGLLdvvQLKtEcp6w8yMWs9D44ymngz8YCFiuNnv2A6qG6Vzu'

      await uut.getUTXOs(addr)
      // console.log('utxoSet: ', utxoSet)
    })
  })

  describe('#getUsd', () => {
    it('should get the current price of AVAX', async () => {
      const price = await uut.getUsd()
      console.log('price: ', price)
    })
  })
})
