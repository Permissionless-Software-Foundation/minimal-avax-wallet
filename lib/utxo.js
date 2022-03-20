const avm = require('avalanche/dist/apis/avm')
/** @type {UTXOs} */
let _this
class UTXOs {
  constructor (localConfig = {}) {
    // Dependency injection.
    this.ava = localConfig.ava
    this.BN = localConfig.BN
    this.avm = avm
    this.bintools = localConfig.bintools

    if (!this.ava) {
      throw new Error('Must pass instance of avalanche on the UTXOLib constructor')
    }

    this.ar = localConfig.ar
    if (!this.ar) {
      throw new Error('Must pass instance of Adapter Router.')
    }

    // UTXO storage. Used as a cache for UTXO information
    // reducing the number of network calls required to retrieve a UTXO.
    this.utxoStore = []
    this.assets = []

    _this = this
  }

  /** Retrieve UTXO data for the wallet from the blockchain. */
  async initUtxoStore (addr) {
    try {
      this.utxoStore = []
      this.assets = []

      const utxos = await this.getUTXOs(addr)
      this.utxoStore = utxos

      const assets = await this.getBalance(addr)
      this.assets = assets
      return this.utxoStore
    } catch (err) {
      console.error('Error in utxos.js/initUtxoStore()')
      throw err
    }
  }

  /** fetch all the UTXOs assosiated with a given address */
  async getUTXOs (addr) {
    if (typeof addr !== 'string' || !addr.length) {
      throw new Error('Address must be a string')
    }

    const utxoSet = await this.ar.getUTXOs(addr)
    const utxos = utxoSet.map(_this.decodeUtxo)

    return utxos
  }

  /** fetch the detailed information about the address assets */
  async getBalance (addr) {
    if (typeof addr !== 'string' || !addr.length) {
      throw new Error('Address must be a string')
    }

    const balances = await this.ar.getBalance(addr)
    // add NFTs
    for (const utxo of this.utxoStore) {
      if (utxo.typeID === 11) {
        balances.push({
          asset: utxo.assetID,
          balance: utxo.amount,
          isNFT: true
        })
      }
    }

    if (balances.length === 0) {
      return []
    }

    const promises = balances.map(asset => this.ar.getAssetDescription(asset.asset))
    const details = await Promise.all(promises)

    const assets = []
    for (let index = 0; index < balances.length; index++) {
      const { asset, balance, ...assetItem } = balances[index]
      const assetDetail = details[index]

      assetItem.assetID = asset
      assetItem.name = assetDetail.name
      assetItem.symbol = assetDetail.symbol
      assetItem.denomination = assetDetail.denomination
      assetItem.amount = parseInt(balance)

      assets.push(assetItem)
    }

    return assets
  }

  /** Returns the utxoid as a Buffer from a given vout and txid */
  getUtxoid (txid, vout) {
    const txidBuffer = _this.bintools.cb58Decode(txid)
    if (typeof vout === 'number' || vout.length < 8) {
      vout = `${vout}`.padStart(8, '0')
    }

    const voutBuffer = Buffer.from(vout, 'hex')
    const utxoid = _this.bintools.bufferToB58(
      Buffer.concat([txidBuffer, voutBuffer])
    )

    return utxoid
  }

  /** Encodes an UTxO from JSON into a TransferableInput for transactions */
  encodeUtxo (utxoJSON, address) {
    const amount = new _this.BN(utxoJSON.amount)
    const addressBuffer = _this.ava.XChain().parseAddress(address)

    const transferInput = new _this.avm.SECPTransferInput(amount)
    transferInput.addSignatureIdx(0, addressBuffer)

    const utxoObject = new _this.avm.TransferableInput(
      _this.bintools.cb58Decode(utxoJSON.txid),
      Buffer.from(utxoJSON.outputIdx, 'hex'),
      _this.bintools.cb58Decode(utxoJSON.assetID),
      transferInput
    )

    return utxoObject // TxInput
  }

  /** Encodes an NFT from JSON into a UTXO object */
  encodeNFT (utxoJSON, address) {
    const addressBuffer = _this.ava.XChain().parseAddress(address)

    const outbound = new _this.avm.NFTTransferOutput(
      utxoJSON.groupID,
      _this.bintools.cb58Decode(utxoJSON.payload),
      [addressBuffer]
    )

    const utxoObject = new _this.avm.UTXO(
      0,
      _this.bintools.cb58Decode(utxoJSON.txid),
      Buffer.from(utxoJSON.outputIdx, 'hex'),
      _this.bintools.cb58Decode(utxoJSON.assetID),
      outbound
    )

    return utxoObject
  }

  /** Encodes an NFT from JSON into a TransferableOperation for transactions */
  encodeNFTOperation (operationJSON, { fromAddress, toAddress }) {
    const fromBuffer = _this.ava.XChain().parseAddress(fromAddress)
    const toBuffer = _this.ava.XChain().parseAddress(toAddress)
    const utxoid = _this.getUtxoid(operationJSON.txid, operationJSON.outputIdx)

    const outbound = new _this.avm.NFTTransferOutput(
      operationJSON.groupID,
      _this.bintools.cb58Decode(operationJSON.payload),
      [toBuffer]
    )

    const operation = new _this.avm.NFTTransferOperation(outbound)
    operation.addSignatureIdx(0, fromBuffer)

    const transferable = new _this.avm.TransferableOperation(
      _this.bintools.cb58Decode(operationJSON.assetID),
      [utxoid],
      operation
    )

    return transferable
  }

  /** Decodes a UTXO object into JSON so it's easily read */
  decodeUtxo (utxoObject) {
    const assetID = utxoObject.getAssetID()
    const txid = utxoObject.getTxID()
    const utxoType = utxoObject.getOutput().getTypeID()
    let amount = 1
    const nftInfo = {}

    if (utxoType === 7) {
      amount = utxoObject.getOutput().getAmount().toNumber()
    }

    if (utxoType === 11) {
      const out = utxoObject.getOutput()
      nftInfo.payload = _this.bintools.cb58Encode(out.getPayload())
      nftInfo.groupID = out.getGroupID()
    }

    const utxoJSON = {
      txid: _this.bintools.cb58Encode(txid),
      outputIdx: utxoObject.getOutputIdx().toString('hex'),
      amount, // it doesn't contain any decimals, it's a big number
      assetID: _this.bintools.cb58Encode(assetID),
      typeID: utxoType,
      ...nftInfo
    }

    return utxoJSON
  }

  /** Creates a TransferableOutput from a JSON Object */
  formatOutput (outputJSON, addressString) {
    const amount = new _this.BN(outputJSON.amount)
    const address = _this.ava.XChain().parseAddress(outputJSON.address || addressString)
    const assetID = _this.bintools.cb58Decode(outputJSON.assetID)

    const transferOutput = new this.avm.SECPTransferOutput(amount, [address])
    const output = new this.avm.TransferableOutput(assetID, transferOutput)

    return output
  }
}

module.exports = UTXOs
