/*
  A utility library for handling the private keys and the mnemonic to get an address

  TODO:

*/

/* eslint-disable no-async-promise-executor */

'use strict'

const { KeyChain } = require('avalanche/dist/apis/evm')
const HDKey = require('hdkey')
const bip39 = require('bip39')

let _this // local global for 'this'.

class CreateLib {
  constructor (localOptions = {}) {
    this.ava = localOptions.ava
    this.binTools = localOptions.binTools
    this.bip39 = bip39
    this.HDKey = HDKey

    if (!this.ava) {
      throw new Error('Must pass instance of avalanche ont AdapterRouter constructor')
    }

    _this = this
  }

  // Create a new wallet from mnemonic keywords. Returns a promise that resolves
  // into a KeyPair.
  async fromMnemonic (mnemonic) {
    try {
      if (typeof mnemonic !== 'string' || !mnemonic.length) {
        throw new Error('invalid parameter')
      }
      const isValidPhrase = this.bip39.validateMnemonic(mnemonic)

      if (!isValidPhrase) {
        throw Error('invalid mnemonic')
      }

      const seed = _this.bip39.mnemonicToSeedSync(mnemonic)
      const masterNode = _this.HDKey.fromMasterSeed(seed)
      const accountNode = masterNode.derive("m/44'/9000'/0'/0/0")

      const xkeyChain = new KeyChain(this.ava.getHRP(), 'X')
      const keypair = xkeyChain.importKey(accountNode.privateKey)

      return _this.formatWalletInfo(keypair, 'mnemonic', mnemonic)
    } catch (error) {
      console.log(`Error on createLib/fromMnemonic(): ${error.message}`)
      throw error
    }
  }

  // Create a new wallet from a privateKey. Returns a promise that resolves into a KeyPair.
  async fromPrivateKey (priv) {
    try {
      if (typeof priv !== 'string' || !priv.length) {
        throw new Error('invalid private Key')
      }

      if (!priv.startsWith('PrivateKey-')) {
        priv = `PrivateKey-${priv}`
      }

      const xkeyChain = new KeyChain(this.ava.getHRP(), 'X')
      const keypair = xkeyChain.importKey(priv)

      return _this.formatWalletInfo(keypair)
    } catch (error) {
      console.log(`Error on createLib/fromPrivateKey(): ${error.message}`)
      throw error
    }
  }

  // Validates whether a given string is a private key
  checkString (key) {
    try {
      if (typeof key !== 'string' || !key.length) {
        throw new Error('invalid parameter')
      }
      const priv = key.replace(/PrivateKey-/gi, '')

      const isBase58 = this.binTools.cb58Decode(priv)
      return Boolean(isBase58)
    } catch (error) {
      // console.log(`Error on createLib/checkString(): ${error.message}`)
      return false
    }
  }

  formatWalletInfo (keyPair, type = 'privateKey', mnemonic = '') {
    return {
      type,
      mnemonic,
      // utxos: [],
      address: keyPair.getAddressString(),
      privateKey: keyPair.getPrivateKeyString(),
      publicKey: keyPair.getPublicKeyString(),
      avax: 0
    }
  }
}

module.exports = CreateLib
