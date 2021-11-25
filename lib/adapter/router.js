/*
  This file routes the network calls to the appropriate adapter, based on
  how this library is instantiated. This allows the code for wallet functions
  to be the same, while building different network adapters that are drop-in
  replacements for one another.
*/

// const network = 'mainnet'
const network = 'fuji'

const networks = require('../networks')
const Axios = require('axios')

class AdapterRouter {
  constructor (localConfig = {}) {
    this.interface = 'rest-api' // default
    this.axios = Axios.default

    if (localConfig.interface === 'json-rpc') {
      this.interface = 'json-rpc'
    }

    // Dependency injection.
    this.ava = localConfig.ava
    if (!this.ava) {
      throw new Error(
        'Must pass instance of avalanche to AdapterRouter constructor'
      )
    }
    this.xchain = this.ava.XChain()
  }

  async getUTXOs (address) {
    try {
      if (typeof address !== 'string' || !address.length) {
        throw new Error('Address must be a string')
      }

      if (this.interface === 'rest-api') {
        const { utxos: utxoSet } = await this.xchain.getUTXOs(address)

        return utxoSet.getAllUTXOs()
      }

      if (this.interface === 'json-rpc') {
        // TODO: implement the JSON RPC method
        return []
      }

      throw new Error('this.interface is not specified')
    } catch (error) {
      console.log('Error in router.js/getUTXOs()')
      throw error
    }
  }

  async getBalance (address) {
    try {
      if (typeof address !== 'string' || !address.length) {
        throw new Error('Address must be a string')
      }

      if (this.interface === 'rest-api') {
        return await this.xchain.getAllBalances(address)
      }

      if (this.interface === 'json-rpc') {
        // TODO: implement the JSON RPC method
        return []
      }

      throw new Error('this.interface is not specified')
    } catch (error) {
      console.log('Error in router.js/getBalance()')
      throw error
    }
  }

  async getAssetDescription (assetId) {
    try {
      if (typeof assetId !== 'string' || !assetId.length) {
        throw new Error('assetId must be a string')
      }

      if (this.interface === 'rest-api') {
        const assetDetails = await this.xchain.getAssetDescription(assetId)

        return assetDetails
      }

      if (this.interface === 'json-rpc') {
        // TODO: implement the JSON RPC method
        return {}
      }

      throw new Error('this.interface is not specified')
    } catch (error) {
      console.log('Error in router.js/getAssetDescription()')
      throw error
    }
  }

  async issueTx (baseTx) {
    try {
      if (typeof baseTx !== 'string' || !baseTx.length) {
        throw new Error('baseTx must be a string')
      }

      if (this.interface === 'rest-api') {
        const txid = await this.xchain.issueTx(baseTx)

        console.log(`https://${networks[network].explorer}/tx/${txid}`)

        return txid
      }

      if (this.interface === 'json-rpc') {
        // TODO: implement the JSON RPC method
        return ''
      }

      throw new Error('this.interface is not specified')
    } catch (error) {
      console.log('Error in router.js/issueTx()')
      throw error
    }
  }

  // Retrieve the most recent transactions for an address from Avascan.
  async getTransactions (address) {
    try {
      if (typeof address !== 'string' || !address.length) {
        throw new Error('The provided avax address is not valid')
      }

      if (this.interface === 'rest-api') {
        const query = `https://${networks[network].explorerAPI}/v2/transactions?address=${address}&sort=timestamp-desc`
        const request = await this.axios.post(query)

        if (request.status >= 400) {
          throw new Error(`No transaction history could be found for ${address}`)
        }

        return request.data.transactions
      }

      if (this.interface === 'json-rpc') {
        // TODO: implement the JSON RPC method
        return []
      }

      throw new Error('this.interface is not specified')
    } catch (err) {
      console.error('Error in avax.js/getTransactions(): ', err)
      throw err
    }
  }
}

module.exports = AdapterRouter
