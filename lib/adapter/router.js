/*
  This file routes the network calls to the appropriate adapter, based on
  how this library is instantiated. This allows the code for wallet functions
  to be the same, while building different network adapters that are drop-in
  replacements for one another.
*/

class AdapterRouter {
  constructor (localConfig = {}) {
    this.interface = 'rest-api' // default

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
}

module.exports = AdapterRouter
