const avm = require('avalanche/dist/apis/avm')
const { KeyChain } = require('avalanche/dist/apis/evm')

const networks = require('../lib/networks')

class Send {
  constructor (localConfig = {}) {
    this.avaxID = localConfig.avaxID || networks.mainnet.avaxID

    // Dependency injection.
    this.ava = localConfig.ava
    this.BN = localConfig.BN
    this.avm = avm
    this.bintools = localConfig.bintools
    this.utxos = localConfig.utxos

    if (!this.ava) {
      throw new Error('Must pass instance of avalanche on the SendLib constructor')
    }

    this.xchain = this.ava.XChain()

    this.ar = localConfig.ar
    if (!this.ar) {
      throw new Error('Must pass instance of Adapter Router.')
    }
  }

  async sendAvax (outputs, walletInfo, utxos) {
    try {
      const transaction = this.createTransaction(
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

  async sendNFT (outputs, walletInfo, utxos) {
    try {
      const transaction = this.createNFTTransaction(
        outputs,
        walletInfo,
        utxos
      )

      return this.ar.issueTx(transaction)
    } catch (err) {
      console.error('Error in send.js/sendNFT()')
      throw err
    }
  }

  // outputs is an array of output objects. Look like this:
  // [{
  //   "address": "X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5",
  //   "amount": 28000000,
  //   "assetID": "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
  // }]
  createTransaction (outputs, walletInfo, utxos) {
    try {
      if (!utxos || utxos.length === 0) {
        throw new Error('UTXO list is empty')
      }

      if (!outputs || outputs.length === 0) {
        throw new Error('outputs list is empty')
      }

      // set avax id as asset Id if null
      outputs.forEach(item => {
        item.assetID = item.assetID || this.avaxID
      })

      // Determine the UTXOs needed to be spent for this TX, and the change
      // that will be returned to the wallet.
      const { inputs, change } = this.getNecessaryUtxosAndChange(
        outputs,
        utxos
      )

      const finalOuts = [...outputs, ...change].filter(utxo => Boolean(utxo.amount))
      const encodedInputs = inputs.map(input => this.utxos.encodeUtxo(input, walletInfo.address))
      const encodedOutputs = finalOuts.map(output => this.utxos.formatOutput(output, walletInfo.address))

      // console.log(`Should be using as inputs: ${JSON.stringify(inputs, null, 2)}`)
      // console.log(`Should be using as outputs: ${JSON.stringify(finalOuts, null, 2)}`)
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
      console.error('Error in send.js/createTransaction()')
      throw err
    }
  }

  // outputs is an array of output objects. Look like this:
  // [{
  //   "address": "X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5",
  //   "assetID": "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
  // }]
  createNFTTransaction (outputs, walletInfo, utxos) {
    try {
      if (!utxos || utxos.length === 0) {
        throw new Error('UTXO list is empty')
      }

      if (!outputs || outputs.length === 0) {
        throw new Error('outputs list is empty')
      }

      // Determine AVAX inputs to pay for fees
      const { inputs, change } = this.getNecessaryUtxosAndChange([], utxos)

      const encodedInputs = inputs.map(input => this.utxos.encodeUtxo(input, walletInfo.address))
      const encodedOutputs = []
      for (const utxo of change) {
        encodedOutputs.push(this.utxos.formatOutput(utxo, walletInfo.address))
      }

      // find the NTFs and code them into the operations array
      const operations = []
      for (const output of outputs) {
        const utxo = utxos.find(item => item.assetID === output.assetID)

        if (!utxo) {
          throw new Error(`NFT with assetID (${output.assetID}) not found in wallet`)
        }

        const op = this.utxos.encodeNFTOperation(utxo, {
          fromAddress: walletInfo.address,
          toAddress: output.address
        })
        operations.push(op)
      }

      const operationTx = new this.avm.OperationTx(
        this.ava.getNetworkID(),
        this.bintools.cb58Decode(this.xchain.getBlockchainID()),
        encodedOutputs,
        encodedInputs,
        Buffer.from(''),
        operations
      )

      const xkeyChain = new KeyChain(this.ava.getHRP(), 'X')
      xkeyChain.importKey(walletInfo.privateKey)

      const unsignedTx = new this.avm.UnsignedTx(operationTx)
      return unsignedTx.sign(xkeyChain).toString()
    } catch (err) {
      console.error('Error in send.js/createNFTTransaction()')
      throw err
    }
  }

  /**
   * Get the UTXOs required to generate a transaction.
   * Uses the all the UTXOs with the given ID first, which maximizes the number UTXOs used.
   * This helps reduce the total number UTXOs in the wallet
   */
  getNecessaryUtxosAndChange (outputs, availableUtxos) {
    try {
      const fee = this.xchain.getTxFee()

      // always take into account avax for the fee
      outputs.unshift({ amount: 0, assetID: this.avaxID })

      const totalOuts = outputs.reduce((ids, utxo) => {
        if (!ids[utxo.assetID]) {
          ids[utxo.assetID] = 0
        }

        // add the avax fee to the required outputs
        if (this.avaxID === utxo.assetID && !ids[utxo.assetID]) {
          ids[utxo.assetID] += fee.toNumber()
        }

        ids[utxo.assetID] += utxo.amount

        return ids
      }, {})

      const inputs = availableUtxos.filter(utxo => Boolean(totalOuts[utxo.assetID]) && utxo.typeID === 7)

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
        const ins = totalIns[assetID] || 0

        const changeAmount = ins - out
        if (changeAmount < 0) {
          throw Error(`Available asset amount (${ins}) below needed asset amount (${out}) for ${assetID}.`)
        }

        if (changeAmount > 0) {
          change.push({ amount: changeAmount, assetID })
        }
      }

      return { inputs, change }
    } catch (error) {
      console.error('Error in send.js/getNecessaryUtxosAndChange()')
      throw error
    }
  }
}

module.exports = Send
