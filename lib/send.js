const { AVMAPI } = require('avalanche/dist/apis/avm')
const avm = require('avalanche/dist/apis/avm')

class Send {
  constructor (localConfig = {}) {
    // Dependency injection.
    this.ava = localConfig.ava
    this.BN = localConfig.BN
    this.avm = avm
    this.bintools = localConfig.bintools
    this.utxos = localConfig.utxos

    if (!this.ava) {
      throw new Error('Must pass instance of avalanche on the SendLib constructor')
    }

    /** @type {AVMAPI} */
    this.xchain = this.ava.XChain()

    this.ar = localConfig.ar
    if (!this.ar) {
      throw new Error('Must pass instance of Adapter Router.')
    }
  }

  async sendAvax (outputs, walletInfo, utxos) {
    try {
      const transaction = await this.createTransaction(
        outputs,
        walletInfo,
        utxos
      )

      const txid = await this.ar.issueTx(transaction)

      // TODO: Remove the spent UTXOs from the utxoStore.

      return txid
    } catch (err) {
      console.error('Error in send.js/sendAvax()')
      throw err
    }
  }

  // Sends Avax to
  async send (utxos, avaxAmount, sendToAddr, changeAddress, walletInfo, memo) {
    try {
      const utxo = utxos[0]
      sendToAddr = this.xchain.parseAddress(sendToAddr)
      changeAddress = this.xchain.parseAddress(changeAddress)
      // Generate a KeyChain from the change address.
      const xkeyChain = this.avm.KeyChain()

      const avaxIDBuffer = await this.xchain.getAVAXAssetID()
      const { denomination } = await this.xchain.getAssetDescription(avaxIDBuffer)
      const addresses = xkeyChain.getAddresses()

      // encode memo
      const memoBuffer = Buffer.from(memo)

      const fee = this.xchain.getDefaultTxFee()
      const navax = parseFloat(avaxAmount) * Math.pow(10, denomination)
      const navaxToSend = new this.BN(navax)
      const utxoBalance = new this.BN(utxo.amount)
      const remainder = utxoBalance.sub(fee).sub(navaxToSend)

      if (remainder.isNeg()) {
        throw new Error('Not enough avax in the selected utxo')
      }

      const inputs = []
      const transferInput = new this.avm.SECPTransferInput(utxoBalance)
      transferInput.addSignatureIdx(0, addresses[0])

      const txInput = new this.avm.TransferableInput(
        this.bintools.cb58Decode(utxo.txid),
        Buffer.from(utxo.outputIdx, 'hex'),
        avaxIDBuffer,
        transferInput
      )

      inputs.push(txInput)

      // get the desired outputs for the transaction
      const outputs = []
      const firstTransferOutput = new this.avm.SECPTransferOutput(navaxToSend, [sendToAddr])
      const firstOutput = new this.avm.TransferableOutput(avaxIDBuffer, firstTransferOutput)
      // Add the first AVAX output = the amount to send to the other address
      outputs.push(firstOutput)

      // add the remainder as output to be sent back to the change address
      if (!remainder.isZero()) {
        const remainderTransferOutput = new this.avm.SECPTransferOutput(remainder, [changeAddress])
        const remainderOutput = new this.avm.TransferableOutput(avaxIDBuffer, remainderTransferOutput)
        outputs.push(remainderOutput)
      }

      // Build the transcation
      const baseTx = new this.avm.BaseTx(
        this.ava.getNetworkID(),
        this.bintools.cb58Decode(this.xchain.getBlockchainID()),
        outputs,
        inputs,
        memoBuffer
      )
      const unsignedTx = new this.avm.UnsignedTx(baseTx)
      return unsignedTx.sign(xkeyChain)
    } catch (err) {
      console.log('Error in sendAvax()')
      throw err
    }
  }

  // outputs is an array of output objects. Look like this:
  // {
  //   "address": X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5
  //   "amount": 28000000,
  //   "assetID": "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
  // },
  async createTransaction (outputs, walletInfo, utxos) {
    try {
      if (!utxos || utxos.length === 0) {
        throw new Error('UTXO list is empty')
      }

      // const fee = this.xchain.getTxFee()

      // Determine the UTXOs needed to be spent for this TX, and the change
      // that will be returned to the wallet.
      const { inputs, change } = this.getNecessaryUtxosAndChange(
        outputs,
        utxos
      )

      const finalOuts = [...outputs, ...change]
      const encodedInputs = inputs.map(input => this.utxos.encodeUtxo(input, walletInfo.address))
      const encodedOutputs = finalOuts.map(output => this.utxos.encodeUtxo(output, walletInfo.address))

      const baseTx = new this.avm.BaseTx(
        this.ava.getNetworkID(),
        this.bintools.cb58Decode(this.xchain.getBlockchainID()),
        encodedInputs,
        encodedOutputs
      )

      return this.bintools.cb58Encode(baseTx.toBuffer())
    } catch (err) {
      console.error('Error in send-bch.js/createTransaction()')
      throw err
    }
  }

  /**
   * Get the UTXOs required to generate a transaction.
   * Uses the all the UTXOs with the given ID first, which maximizes the number UTXOs used.
   * This helps reduce the total number UTXOs in the wallet
   */
  getNecessaryUtxosAndChange (outputs, availableUtxos) {
    const totalOuts = outputs.reduce((ids, utxo) => {
      if (!ids[utxo.assetID]) {
        ids[utxo.assetID] = 0
      }
      ids[utxo.assetID] += utxo.amount
      return ids
    }, {})

    const inputs = availableUtxos.filter(utxo => Boolean(totalOuts[utxo.assetID]))

    const totalIns = inputs.reduce((ids, utxo) => {
      if (!ids[utxo.assetID]) {
        ids[utxo.assetID] = 0
      }
      ids[utxo.assetID] += utxo.amount
      return ids
    }, {})

    const change = []
    for (const assetID in totalOuts) {
      const out = totalOuts[assetID]
      const ins = totalIns[assetID]

      const changeAmount = ins - out
      if (changeAmount < 0) {
        throw Error(`Available asset amount (${ins}) below needed asset amount (${out}) for ${assetID}.`)
      }

      if (changeAmount > 0) {
        change.push({ amount: changeAmount, assetID })
      }
    }

    return { inputs, change }
  }
}

module.exports = Send
