const SendLib = require('./send')
const UtxoLib = require('./utxo')

const avm = require('avalanche/dist/apis/avm')
const { KeyChain } = require('avalanche/dist/apis/evm')

class Tokens {
  constructor (localConfig = {}) {
    // Dependency injection.
    this.ava = localConfig.ava
    this.BN = localConfig.BN
    this.avm = avm
    this.bintools = localConfig.bintools

    if (!this.ava) {
      throw new Error('Must pass instance of avalanche on the TokensLib constructor')
    }

    this.xchain = this.ava.XChain()

    this.ar = localConfig.ar
    if (!this.ar) {
      throw new Error('Must pass instance of Adapter Router.')
    }

    this.sendLib = new SendLib(localConfig)
    this.utxos = new UtxoLib(localConfig)
  }

  async burnTokens (amount, assetID, walletInfo, utxos) {
    try {
      const burnTx = this.createBurnTransaction(
        amount,
        assetID,
        walletInfo,
        utxos
      )

      const txid = await this.ar.issueTx(burnTx)

      return txid
    } catch (err) {
      console.error('Error in send.js/sendAvax()')
      throw err
    }
  }

  createBurnTransaction (amount, assetID, walletInfo, utxos) {
    try {
      if (typeof amount !== 'number' || amount <= 0) {
        throw new Error('amount must  be greater than 0')
      }

      if (typeof assetID !== 'string' || assetID.length === 0) {
        throw new Error('assetID must be a cb58 string')
      }

      if (!walletInfo || typeof walletInfo !== 'object') {
        throw new Error('walletInfo is required')
      }

      if (!Array.isArray(utxos) || !utxos.length) {
        throw new Error('utxos must be an array')
      }

      // Count them to create the change, but leave them out so it burns the given token
      const burnUTXO = { amount, assetID }

      const { inputs, change } = this.sendLib.getNecessaryUtxosAndChange(
        [burnUTXO],
        utxos
      )

      const finalOuts = change.filter(utxo => Boolean(utxo.amount))
      const encodedInputs = inputs.map(input => this.utxos.encodeUtxo(input, walletInfo.address))
      const encodedOutputs = finalOuts.map(output => this.utxos.formatOutput(output, walletInfo.address))

      const baseTx = new this.avm.BaseTx(
        this.ava.getNetworkID(),
        this.bintools.cb58Decode(this.xchain.getBlockchainID()),
        encodedOutputs,
        encodedInputs
      )

      const xkeyChain = new KeyChain(this.ava.getHRP(), 'X')
      xkeyChain.importKey(walletInfo.privateKey)

      const unsignedTx = new this.avm.UnsignedTx(baseTx)
      return unsignedTx.sign(xkeyChain).toString()
    } catch (err) {
      console.error('Error in send-bch.js/createBurnTransaction()')
      throw err
    }
  }
}

module.exports = Tokens
