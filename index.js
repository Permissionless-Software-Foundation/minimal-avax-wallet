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
const Send = require('./lib/send')
const Tokens = require('./lib/tokens')
const crypto = require('crypto-js')

// let _this // local global for 'this'.

class MinimalAvaxWallet {
  constructor (hdPrivateKeyOrMnemonic, advancedOptions = {}) {
    this.host = advancedOptions.host || 'api.avax.network'
    this.port = advancedOptions.port || 443
    this.protocol = advancedOptions.protocol || 'https'
    this.networkID = advancedOptions.networkID || 1

    // Allow passing of noUpdate flag, to prevent automatic UTXO retrieval
    // after wallet is created.
    this.noUpdate = Boolean(advancedOptions.noUpdate)

    // Encapsulae the external libraries.
    this.ava = new Avalanche(this.host, this.port, this.protocol, this.networkID)
    this.bintools = BinTools.getInstance()
    this.BN = BN
    this.bip39 = bip39
    this.crypto = crypto

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
    advancedOptions.utxos = this.utxos
    this.sendAvax = new Send(advancedOptions)
    this.tokens = new Tokens(advancedOptions)

    // walletInfoPromise will return a promise that will resolve to 'true'
    // once the wallet has been created. The wallet information will be stored
    // in walletInfo.
    this.walletInfo = {} // Placeholder
    this.walletInfoCreated = false
    this.walletInfoPromise = this.createWallet(hdPrivateKeyOrMnemonic)
    // _this = this
  }

  /** Create a new wallet from a privateKey or a mnemonic key word */
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
        await this.utxos.initUtxoStore(walletInfo.address)
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

  /** Get transactions associated with an address or the default avax address. */
  async getTransactions (address) {
    const avaxAddr = address || this.walletInfo.address
    const txs = await this.ar.getTransactions(avaxAddr)

    const history = txs.map(tx => tx.id)
    return history
  }

  /** Get the UTXO information for this wallet. */
  getUtxos () {
    return this.utxos.initUtxoStore(this.walletInfo.address)
  }

  /** Print all the assets held by this wallet */
  listAssets () {
    return this.utxos.getBalance(this.walletInfo.address)
  }

  /** Send AVAX or any ANT */
  send (outputs) {
    try {
      return this.sendAvax.sendAvax(
        outputs,
        this.walletInfo,
        this.utxos.utxoStore
      )
    } catch (err) {
      console.error('Error in send()')
      throw err
    }
  }

  /** Burn AVAX or any ANT */
  burnTokens (amount, assetId) {
    try {
      return this.tokens.burnTokens(
        amount,
        assetId,
        this.walletInfo,
        this.utxos.utxoStore
      )
    } catch (err) {
      console.error('Error in burnTokens()')
      throw err
    }
  }

  /** Send NFT to a given address */
  sendNFT (outputs) {
    try {
      return this.sendAvax.sendNFT(
        outputs,
        this.walletInfo,
        this.utxos.utxoStore
      )
    } catch (err) {
      console.error('Error in sendNFT()')
      throw err
    }
  }

  /** Encrypt the mnemonic of the wallet. */
  encrypt (mnemonic, password) {
    return this.crypto.AES.encrypt(mnemonic, password).toString()
  }

  /** Decrypt the mnemonic of the wallet. */
  decrypt (mnemonicEncrypted, password) {
    let mnemonic

    try {
      mnemonic = this.crypto.AES.decrypt(mnemonicEncrypted, password).toString(
        this.crypto.enc.Utf8
      )
    } catch (err) {
      throw new Error('Wrong password')
    }

    return mnemonic
  }

  // Get the spot price of AVAX in USD.
  async getUsd () {
    return await this.ar.getUsd()
  }
}

module.exports = MinimalAvaxWallet
