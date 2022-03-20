/*
  Unit tests for the create.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

const { Avalanche, BinTools, BN } = require('avalanche')
const mocks = require('./mocks/utxos-mock')

const UTXOLib = require('../../lib/utxo')
const AdapterRouter = require('../../lib/adapter/router')
/** @type {UTXOLib} */
let uut // Unit Under Test

describe('#UTXOLib', () => {
  let sandbox
  let mockData

  // Restore the sandbox before each test.
  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockData = cloneDeep(mocks)

    const config = {
      ava: new Avalanche('api.avax.network', 443, 'https'),
      bintools: BinTools.getInstance(),
      BN
    }

    config.ar = new AdapterRouter(config)
    uut = new UTXOLib(config)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if the ava property is not passed in the localConfig', () => {
      try {
        uut = new UTXOLib()
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Must pass instance of avalanche on the UTXOLib constructor')
      }
    })

    it('should throw an error if an instance of the Router is not passed in the constructor', () => {
      try {
        const config = {
          ava: new Avalanche('api.avax.network', 443, 'https'),
          bintools: BinTools.getInstance()
        }

        uut = new UTXOLib(config)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Must pass instance of Adapter Router.')
      }
    })
  })

  describe('#getUTXOs', () => {
    it('should throw an error if the passed value is not a string or its empty', async () => {
      try {
        await uut.getUTXOs(null)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Address must be a string')
      }
    })

    it('should return the collection of UTXOs given the router', async () => {
      try {
        sandbox.stub(uut.ar.xchain, 'getUTXOs').resolves({ utxos: mockData.utxoSet })

        const utxos = await uut.getUTXOs(mockData.addressString)
        assert.isTrue(Array.isArray(utxos))
        assert.equal(utxos.length, 3)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#getBalance', () => {
    it('should throw an error if the passed value is not a string or its empty', async () => {
      try {
        await uut.getBalance(null)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Address must be a string')
      }
    })

    it('should return an empty array', async () => {
      try {
        sandbox.stub(uut.ar.xchain, 'getAllBalances').resolves([])

        const balances = await uut.getBalance(mockData.addressString)
        assert.isTrue(Array.isArray(balances))
        assert.equal(balances.length, 0)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should return a detailed collection for the balance in the address', async () => {
      try {
        sandbox.stub(uut.ar.xchain, 'getAllBalances').resolves(mockData.balances)
        sandbox.stub(uut.ar.xchain, 'getAssetDescription').resolves(mockData.assetDescription)

        const balances = await uut.getBalance(mockData.addressString)
        assert.isTrue(Array.isArray(balances))
        assert.hasAllKeys(balances[0], [
          'assetID',
          'name',
          'symbol',
          'denomination',
          'amount'
        ])
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should take into account the NFT as well', async () => {
      try {
        sandbox.stub(uut.ar.xchain, 'getAllBalances').resolves(mockData.balances)
        const stub = sandbox.stub(uut.ar.xchain, 'getAssetDescription')

        stub.onCall(0)
          .resolves(mockData.assetDescription)

        stub.onCall(1)
          .resolves(mockData.nftDescription)

        uut.utxoStore = [mockData.nftUtxoJSON]
        const balances = await uut.getBalance(mockData.addressString)
        assert.isTrue(Array.isArray(balances))
        assert.hasAllKeys(balances[1], [
          'assetID',
          'name',
          'symbol',
          'denomination',
          'amount',
          'isNFT'
        ])
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#getUtxoid', () => {
    it('should return the UTXOID', async () => {
      const id = uut.getUtxoid(
        mockData.nftUtxoJSON.txid,
        mockData.nftUtxoJSON.outputIdx
      )

      assert.equal(id, 'Cf4Hijr16BdAtA7itDbEYDse5i7VmhESAERJzkvnzfkhtyMC3')
    })

    it('should turn the vout into a number and return the UTXOID', async () => {
      const id = uut.getUtxoid(
        mockData.nftUtxoJSON.txid,
        +mockData.nftUtxoJSON.outputIdx
      )

      assert.equal(id, 'Cf4Hijr16BdAtA7itDbEYDse5i7VmhESAERJzkvnzfkhtyMC3')
    })
  })

  describe('#encodeUtxo', () => {
    it('should return a valid TransferableInput', async () => {
      try {
        const utxo = await uut.encodeUtxo(mockData.utxoJSON, mockData.addressString)

        assert.isTrue(utxo instanceof uut.avm.TransferableInput)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#encodeNFT', () => {
    it('should return a valid UTXO with a NFTTransferOutput', async () => {
      try {
        const utxo = await uut.encodeNFT(mockData.nftUtxoJSON, mockData.addressString)

        assert.isTrue(utxo instanceof uut.avm.UTXO)

        const output = utxo.getOutput()
        assert.isTrue(output instanceof uut.avm.NFTTransferOutput)

        const assetID = uut.bintools.cb58Encode(utxo.getAssetID())
        assert.equal(assetID, mockData.nftUtxoJSON.assetID)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#encodeNFTOperation', () => {
    it('should return a valid TransferableOperation to add to a transaction', async () => {
      try {
        const transferable = await uut.encodeNFTOperation(
          mockData.nftUtxoJSON,
          {
            fromAddress: mockData.addressString,
            toAddress: 'X-avax1anlgfmys9m7fcu5frkdnga6eajka37lzem8wp4'
          }
        )

        assert.isTrue(transferable instanceof uut.avm.TransferableOperation)

        const operation = transferable.getOperation()
        assert.isTrue(operation instanceof uut.avm.NFTTransferOperation)

        const assetID = uut.bintools.cb58Encode(transferable.getAssetID())
        assert.equal(assetID, mockData.nftUtxoJSON.assetID)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#decodeUtxo', () => {
    it('should return a valid JSON', async () => {
      try {
        const utxo = uut.decodeUtxo(mockData.utxoSet.getAllUTXOs()[0])

        assert.hasAllKeys(utxo, ['txid', 'outputIdx', 'amount', 'assetID', 'typeID'])

        assert.equal(utxo.txid, mockData.utxoJSON.txid)
        assert.equal(utxo.outputIdx, mockData.utxoJSON.outputIdx)
        assert.equal(utxo.amount, mockData.utxoJSON.amount)
        assert.equal(utxo.assetID, mockData.utxoJSON.assetID)
        assert.equal(utxo.typeID, mockData.utxoJSON.typeID)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should return a valid JSON for a NFT', async () => {
      try {
        const utxoObject = uut.encodeNFT(mockData.nftUtxoJSON, mockData.addressString)
        const utxoJSON = uut.decodeUtxo(utxoObject)

        assert.hasAllKeys(
          utxoJSON,
          ['txid', 'outputIdx', 'amount', 'assetID', 'typeID', 'payload', 'groupID']
        )

        assert.equal(utxoJSON.txid, mockData.nftUtxoJSON.txid)
        assert.equal(utxoJSON.outputIdx, mockData.nftUtxoJSON.outputIdx)
        assert.equal(utxoJSON.amount, mockData.nftUtxoJSON.amount)
        assert.equal(utxoJSON.assetID, mockData.nftUtxoJSON.assetID)
        assert.equal(utxoJSON.typeID, mockData.nftUtxoJSON.typeID)
        assert.equal(utxoJSON.groupID, mockData.nftUtxoJSON.groupID)
        assert.equal(utxoJSON.payload, mockData.nftUtxoJSON.payload)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#initUtxoStore', () => {
    it('should catch the error', async () => {
      try {
        await uut.initUtxoStore(null)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Address must be a string')
      }
    })

    it('should update the utxoStore', async () => {
      try {
        sandbox.stub(uut.ar.xchain, 'getUTXOs').resolves({ utxos: mockData.utxoSet })

        await uut.initUtxoStore(mockData.addressString)
        assert.isTrue(uut.utxoStore.length > 0)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#formatOutput', () => {
    it('should return a output object (TransferableOutput)', async () => {
      try {
        const outputJSON = {
          address: 'X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5',
          amount: 28000000,
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'
        }

        const transferableOutput = await uut.formatOutput(outputJSON, mockData.addressString)

        assert.equal(uut.bintools.cb58Encode(transferableOutput.getAssetID()), outputJSON.assetID)

        const output = transferableOutput.getOutput()
        const address = uut.ava.XChain().addressFromBuffer(output.getAddresses()[0])
        assert.equal(address, outputJSON.address)
        assert.equal(output.getAmount().toNumber(), outputJSON.amount)
      } catch (err) {
        // assert.fail('Unexpected result')
        console.log(err)
      }
    })

    it('should return a output object (TransferableOutput) with the default address', async () => {
      try {
        const outputJSON = {
          amount: 28000000,
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'
        }

        const transferableOutput = await uut.formatOutput(outputJSON, mockData.addressString)

        const output = transferableOutput.getOutput()
        const address = uut.ava.XChain().addressFromBuffer(output.getAddresses()[0])
        assert.equal(address, mockData.addressString)
      } catch (err) {
        // assert.fail('Unexpected result')
        console.log(err)
      }
    })
  })
})
