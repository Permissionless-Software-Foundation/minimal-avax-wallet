
const Avalanche = require('avalanche')
const bintools = Avalanche.BinTools.getInstance()
const avm = Avalanche.avm
const xchain = new Avalanche.Avalanche('', 443).XChain()
const BN = Avalanche.BN

const addressString = 'X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5'
const address = xchain.parseAddress('X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5', '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM')
const txid = '28pzQqAnSaCrQgpTjs33xAihFX4bKRMz3K6rg3mfmbZQAPjhUS'
const txidBuffer = bintools.cb58Decode(txid)
const avaxID = 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'
const avaxIDBuffer = bintools.cb58Decode(avaxID)

const assetDescription = {
  name: 'Avalanche',
  symbol: 'AVAX',
  assetID: avaxID,
  denomination: 9
}

const balances = [{ asset: 'AVAX', balance: '1001000000' }]

const utxoJSON = {
  txid,
  outputIdx: '00000000',
  amount: 1000000000,
  assetID: avaxID,
  typeID: 7
}

const codecID = bintools.fromBNToBuffer(new BN(0))
const utxos = [
  new avm.UTXO(
    codecID,
    txidBuffer,
    Buffer.from('00000000', 'hex'),
    avaxIDBuffer,
    new avm.SECPTransferOutput(new BN(1000000000), [address])
  ),
  new avm.UTXO(
    codecID,
    bintools.cb58Decode('28riNJo6B7XH5w63aZR3JDvoihoKJNNEN82HEdWr5CeL5rGywR'),
    Buffer.from('00000001', 'hex'),
    avaxIDBuffer,
    new avm.SECPTransferOutput(new BN(350000), [address])
  ),
  new avm.UTXO(
    codecID,
    bintools.cb58Decode('DDZhRidbMFZdeYQ5CQ5WVQg7EPEpNW63EUAYWmYwxVfgVK8ey'),
    Buffer.from('00000002', 'hex'),
    avaxIDBuffer,
    new avm.SECPTransferOutput(new BN(650000), [address])
  )
]

const utxoSet = new avm.UTXOSet()
utxoSet.addArray(utxos)

module.exports = {
  utxoSet,
  balances,
  assetDescription,
  addressString,
  avaxID,
  utxoJSON,
  txid
}
