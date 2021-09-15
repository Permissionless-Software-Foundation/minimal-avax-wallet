/*
  Unit tests for the create.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

const { Avalanche, BinTools } = require('avalanche')
const mocks = require('./mocks/utxos-mock')

const AdapterRouter = require('../../lib/adapter/router')
/** @type {AdapterRouter} */
let uut // Unit Under Test

describe('#AdapterRouter', () => {
  let sandbox
  let mockData

  // Restore the sandbox before each test.
  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockData = cloneDeep(mocks)

    const config = {
      ava: new Avalanche('api.avax.network', 443, 'https'),
      bintools: BinTools.getInstance()
    }

    uut = new AdapterRouter(config)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if the ava property is not passed in the localConfig', async () => {
      try {
        uut = new AdapterRouter()
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Must pass instance of avalanche ont AdapterRouter constructor')
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

    it('should return a collection of UTXOs', async () => {
      try {
        sandbox.stub(uut.xchain, 'getUTXOs').resolves({ utxos: mockData.utxoSet })

        const utxos = await uut.getUTXOs(mockData.addressString)
        assert.isTrue(Array.isArray(utxos))
        assert.equal(utxos.length, 3)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should return a collection of UTXOs using the JSON RPC', async () => {
      const config = {
        ava: new Avalanche('api.avax.network', 443, 'https'),
        bintools: BinTools.getInstance(),
        interface: 'json-rpc'
      }

      uut = new AdapterRouter(config)

      try {
        const utxos = await uut.getUTXOs(mockData.addressString)
        assert.isTrue(Array.isArray(utxos))
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should throw an error if the interface is not defined or unknown', async () => {
      uut.interface = 'random'

      try {
        await uut.getUTXOs(mockData.addressString)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'this.interface is not specified')
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

    it('should return a collection of object with assetID and amount', async () => {
      try {
        sandbox.stub(uut.xchain, 'getBalance').resolves(mockData.balances)

        const balance = await uut.getBalance(mockData.addressString)
        assert.isTrue(Array.isArray(balance))
        assert.hasAllKeys(balance[0], ['asset', 'balance'])
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should return a collection of balances using the JSON RPC', async () => {
      const config = {
        ava: new Avalanche('api.avax.network', 443, 'https'),
        bintools: BinTools.getInstance(),
        interface: 'json-rpc'
      }

      uut = new AdapterRouter(config)

      try {
        const balance = await uut.getBalance(mockData.addressString)
        assert.isTrue(Array.isArray(balance))
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should throw an error if the interface is not defined or unknown', async () => {
      uut.interface = 'random'

      try {
        await uut.getBalance(mockData.addressString)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'this.interface is not specified')
      }
    })
  })

  describe('#getAssetDescription', () => {
    it('should throw an error if the passed value is not a string or its empty', async () => {
      try {
        await uut.getAssetDescription(null)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'assetId must be a string')
      }
    })

    it('should return the avax asset details', async () => {
      try {
        sandbox.stub(uut.xchain, 'getAssetDescription').resolves(mockData.assetDescription)

        const description = await uut.getAssetDescription(mockData.avaxID)
        assert.isObject(description)
        assert.hasAllKeys(description, [
          'name',
          'symbol',
          'assetID',
          'denomination'
        ])
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should return athe avax asset details using the JSON RPC', async () => {
      const config = {
        ava: new Avalanche('api.avax.network', 443, 'https'),
        bintools: BinTools.getInstance(),
        interface: 'json-rpc'
      }

      uut = new AdapterRouter(config)

      try {
        const description = await uut.getAssetDescription(mockData.avaxID)
        assert.isObject(description)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should throw an error if the interface is not defined or unknown', async () => {
      uut.interface = 'random'

      try {
        await uut.getAssetDescription(mockData.avaxID)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'this.interface is not specified')
      }
    })
  })

  describe('#issueTx', () => {
    it('should throw an error if the passed value is not a string or its empty', async () => {
      try {
        await uut.issueTx(null)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'baseTx must be a string')
      }
    })

    it('should issue the given transaction and return a txid', async () => {
      try {
        sandbox.stub(uut.xchain, 'issueTx').resolves(mockData.txid)

        const txid = await uut.issueTx('hereGoesACB58TxString')
        assert.typeOf(txid, 'string')
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should issue the given transaction and return a txid using the JSON RPC', async () => {
      const config = {
        ava: new Avalanche('api.avax.network', 443, 'https'),
        bintools: BinTools.getInstance(),
        interface: 'json-rpc'
      }

      uut = new AdapterRouter(config)

      try {
        const txid = await uut.issueTx('hereGoesACB58TxString')
        assert.typeOf(txid, 'string')
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should throw an error if the interface is not defined or unknown', async () => {
      uut.interface = 'random'

      try {
        await uut.issueTx('hereGoesACB58TxString')
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'this.interface is not specified')
      }
    })
  })
})
