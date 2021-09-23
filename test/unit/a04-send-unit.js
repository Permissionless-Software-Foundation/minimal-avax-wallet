/*
  Unit tests for the create.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

const { Avalanche, BinTools, BN } = require('avalanche')
const mocks = require('./mocks/utxos-mock')

const SendLib = require('../../lib/send')
const UTXOLib = require('../../lib/utxo')
const AdapterRouter = require('../../lib/adapter/router')
/** @type {SendLib} */
let uut // Unit Under Test

describe('#SendLib', () => {
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
    config.utxos = new UTXOLib(config)
    uut = new SendLib(config)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if the ava property is not passed in the localConfig', () => {
      try {
        uut = new SendLib()
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Must pass instance of avalanche on the SendLib constructor')
      }
    })

    it('should throw an error if an instance of the Router is not passed in the constructor', () => {
      try {
        const config = {
          ava: new Avalanche('api.avax.network', 443, 'https'),
          bintools: BinTools.getInstance()
        }

        uut = new SendLib(config)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Must pass instance of Adapter Router.')
      }
    })
  })

  describe('#getNecessaryUtxosAndChange', () => {
    it('should throw an error if the output sum is greater than the change', () => {
      try {
        const outputs = [{
          address: 'X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5',
          amount: 4000,
          assetID: mockData.arepaUtxoJSON.assetID
        }]

        uut.getNecessaryUtxosAndChange(outputs, [mockData.utxoJSON, mockData.arepaUtxoJSON])
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Available asset amount')
      }
    })

    it('should throw an error if any assetID in the outputs is not present in the wallet', () => {
      try {
        const outputs = [{
          address: 'X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5',
          amount: 4000,
          assetID: '2qD6DQHDgs7xorUaqgWQRgoQSoQL6zRDhLe1NqpbfQVz29dnWc '
        }]

        uut.getNecessaryUtxosAndChange(outputs, [mockData.utxoJSON, mockData.arepaUtxoJSON])
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Available asset amount')
      }
    })

    it('should return only avax inputs and change', () => {
      try {
        const outputs = [{
          address: 'X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5',
          amount: 5000000,
          assetID: mockData.avaxID
        }]

        const { inputs, change } = uut.getNecessaryUtxosAndChange(outputs, [mockData.utxoJSON, mockData.arepaUtxoJSON])

        assert.equal(inputs.length, 1)
        assert.equal(inputs[0].assetID, mockData.avaxID)

        assert.equal(change.length, 1)
        assert.equal(change[0].assetID, mockData.avaxID)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should return only avax inputs without change', () => {
      try {
        const outputs = [{
          address: 'X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5',
          amount: 999000000,
          assetID: mockData.avaxID
        }]

        const { inputs, change } = uut.getNecessaryUtxosAndChange(
          outputs,
          [mockData.utxoJSON, mockData.arepaUtxoJSON]
        )

        assert.equal(inputs.length, 1)
        assert.equal(inputs[0].assetID, mockData.avaxID)
        console.log(change)
        assert.equal(change.length, 0)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should return token inputs alongside avax inputs to pay for fee', () => {
      try {
        const outputs = [{
          address: 'X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5',
          amount: 780,
          assetID: mockData.arepaUtxoJSON.assetID
        }]

        const { inputs, change } = uut.getNecessaryUtxosAndChange(
          outputs,
          [mockData.utxoJSON, mockData.arepaUtxoJSON, mockData.arepaUtxoJSON]
        )

        assert.equal(inputs.length, 3)
        assert.equal(inputs[0].assetID, mockData.avaxID)
        assert.equal(inputs[1].assetID, mockData.arepaUtxoJSON.assetID)

        assert.equal(change.length, 1)
        assert.equal(change[0].assetID, mockData.avaxID)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#createTransaction', () => {
    it('should throw an error if the utxo argument is not an array or is empty', () => {
      try {
        uut.createTransaction(null)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'UTXO list is empty')
      }
    })

    it('should return an avax Tx as string', () => {
      try {
        const outputs = [{
          address: 'X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5',
          amount: 5000000,
          assetID: mockData.avaxID
        }]

        const baseTx = uut.createTransaction(outputs, mockData.mockWallet, [mockData.utxoJSON, mockData.arepaUtxoJSON])

        assert.isString(baseTx)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should return a token Tx as string', () => {
      try {
        const outputs = [{
          address: 'X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5',
          amount: 390,
          assetID: mockData.arepaUtxoJSON.assetID
        }]

        const baseTx = uut.createTransaction(outputs, mockData.mockWallet, [mockData.utxoJSON, mockData.arepaUtxoJSON])

        assert.isString(baseTx)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#sendAvax', () => {
    it('should throw and catch an error', async () => {
      try {
        await uut.sendAvax(null, mockData.mockWallet, [mockData.utxoJSON, mockData.arepaUtxoJSON])
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'outputs list is empty')
      }
    })

    it('should broadcast the Tx', async () => {
      try {
        sandbox.stub(uut.ar, 'issueTx').resolves('sometxid')

        const outputs = [{
          address: 'X-avax10jpl6x8egfmfmj4fxdf078870q32vr96rvdjn5',
          amount: 5000000,
          assetID: mockData.avaxID
        }]

        const txid = await uut.sendAvax(outputs, mockData.mockWallet, [mockData.utxoJSON, mockData.arepaUtxoJSON])

        assert.equal(txid, 'sometxid')
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })
})
