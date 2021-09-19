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

  describe('#decodeUtxo', () => {
    it('should return a valid JSON', async () => {
      try {
        const utxo = await uut.decodeUtxo(mockData.utxoSet.getAllUTXOs()[0])

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
})
