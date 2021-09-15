/*
  An npm JavaScript library for front end web apps. Implements a minimal
  AVAX X-chain wallet.
*/

/* eslint-disable no-async-promise-executor */

'use strict'

const { Avalanche, BinTools, BN } = require('avalanche')
const bip39 = require('bip39')

const Util = require('./lib/util')
const util = new Util()

// Local libraries
const CreateLib = require('./lib/create')
const UTXOs = require('./lib/utxo')
const AdapterRouter = require('./lib/adapter/router')

// let _this // local global for 'this'.

class MinimalAvaxWallet {
  constructor (hdPrivateKeyOrMnemonic, advancedOptions = {}) {
    this.host = advancedOptions.host || 'api.avax.network'
    this.port = advancedOptions.port || 443
    this.protocol = advancedOptions.protocol || 'https'

    // Allow passing of noUpdate flag, to prevent automatic UTXO retrieval
    // after wallet is created.
    this.noUpdate = Boolean(advancedOptions.noUpdate)

    // Encapsulae the external libraries.
    this.ava = new Avalanche(this.host, this.port, this.protocol)
    this.bintools = BinTools.getInstance()
    this.BN = BN
    this.bip39 = bip39

    this.util = util

    advancedOptions.ava = this.ava
    advancedOptions.bintools = this.bintools
    advancedOptions.BN = this.BN

    // The adapter router is used to route network calls through the appropriate
    // network medium (http or IPFS)
    this.ar = new AdapterRouter(advancedOptions)
    advancedOptions.ar = this.ar

    // Instantiate local libraries.
    this.create = new CreateLib(advancedOptions)
    this.utxos = new UTXOs(advancedOptions)

    // walletInfoPromise will return a promise that will resolve to 'true'
    // once the wallet has been created. The wallet information will be stored
    // in walletInfo.
    this.walletInfo = {} // Placeholder
    this.walletInfoCreated = false
    this.walletInfoPromise = this.createWallet(hdPrivateKeyOrMnemonic)
    // _this = this
  }

  async createWallet (key) {
    try {
      key = key || this.bip39.generateMnemonic(256)
      key = key.replace(/\s+/gi, ' ')
      let walletInfo = {}

      if (this.create.checkString(key)) {
        walletInfo = await this.create.fromPrivateKey(key)
      } else {
        walletInfo = await this.create.fromMnemonic(key)
      }

      if (!this.noUpdate) {
        // Get any  UTXOs for this address.
        await this.utxos.getUTXOs(walletInfo.address)
      }

      this.walletInfoCreated = true
      this.walletInfo = walletInfo
      // console.log(JSON.stringify(walletInfo, null, 2))

      return true
    } catch (error) {
      console.log(`Error on createWallet(): ${error.message}`)
      throw error
    }
  }

  // Get the UTXO information for this wallet.
  getUtxos () {
    return this.utxos.initUtxoStore(this.walletInfo.address)
  }
}

module.exports = MinimalAvaxWallet
