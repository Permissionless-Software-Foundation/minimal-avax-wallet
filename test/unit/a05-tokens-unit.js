// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

const { Avalanche, BinTools, BN } = require('avalanche')
const mocks = require('./mocks/utxos-mock')

const TokensLib = require('../../lib/tokens')
const AdapterRouter = require('../../lib/adapter/router')
/** @type {TokensLib} */
let uut // Unit Under Test

describe('#TokensLib', () => {
  let sandbox

  /** @type {mocks} */
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
    uut = new TokensLib(config)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if the ava property is not passed in the localConfig', () => {
      try {
        uut = new TokensLib()
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Must pass instance of avalanche on the TokensLib constructor')
      }
    })

    it('should throw an error if an instance of the Router is not passed in the constructor', () => {
      try {
        const config = {
          ava: new Avalanche('api.avax.network', 443, 'https'),
          bintools: BinTools.getInstance()
        }

        uut = new TokensLib(config)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Must pass instance of Adapter Router.')
      }
    })
  })

  describe('#createBurnTransaction', () => {
    it('should throw an error if the amount is not set or less than zero', () => {
      try {
        uut.createBurnTransaction()
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'amount must  be greater than 0')
      }
    })

    it('should throw an error if the assetID is not passed as argument', () => {
      try {
        uut.createBurnTransaction(10)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'assetID must be a cb58 string')
      }
    })

    it('should throw an error if the walletInfo is not valid', () => {
      try {
        const assetID = mockData.arepaUtxoJSON.assetID

        uut.createBurnTransaction(10, assetID, null)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'walletInfo is required')
      }
    })

    it('should throw an error if the utxos is an empty array', () => {
      try {
        const assetID = mockData.arepaUtxoJSON.assetID
        const utxos = []

        uut.createBurnTransaction(10, assetID, mockData.mockWallet, utxos)
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'utxos must be an array')
      }
    })

    it('should return a tx that burns all the tokens', () => {
      try {
        const assetID = mockData.arepaUtxoJSON.assetID
        const buffer = uut.bintools.cb58Decode(mockData.arepaUtxoJSON.assetID)
        const utxos = [mockData.utxoJSON, mockData.arepaUtxoJSON]
        const amountToBurn = 390

        const baseTx = uut.createBurnTransaction(
          amountToBurn,
          assetID,
          mockData.mockWallet,
          utxos
        )

        assert.isString(baseTx)

        const signed = new uut.avm.Tx()
        signed.fromString(baseTx)

        const unsigned = signed.getUnsignedTx()
        const burnedAmount = unsigned.getBurn(buffer).toNumber()
        assert.equal(burnedAmount, amountToBurn)
        // since all the ANT were burned, it should only have one avax output
        assert.equal(unsigned.getTransaction().getOuts().length, 1)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })

    it('should return a tx that burns an specific amount', () => {
      try {
        const assetID = mockData.arepaUtxoJSON.assetID
        const buffer = uut.bintools.cb58Decode(mockData.arepaUtxoJSON.assetID)
        const utxos = [mockData.utxoJSON, mockData.arepaUtxoJSON]
        const amountToBurn = 200

        const baseTx = uut.createBurnTransaction(
          amountToBurn,
          assetID,
          mockData.mockWallet,
          utxos
        )

        assert.isString(baseTx)

        const signed = new uut.avm.Tx()
        signed.fromString(baseTx)

        const unsigned = signed.getUnsignedTx()
        const burnedAmount = unsigned.getBurn(buffer).toNumber()
        assert.equal(burnedAmount, amountToBurn)
        // as just some of the ANT were burned, it should return two outputs
        assert.equal(unsigned.getTransaction().getOuts().length, 2)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#burnTokens', () => {
    it('should throw and catch an error', async () => {
      try {
        const amountToBurn = 0
        const assetID = ''
        const utxos = []

        await uut.burnTokens(
          amountToBurn,
          assetID,
          mockData.mockWallet,
          utxos
        )
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'amount must  be greater than 0')
      }
    })

    it('should broadcast the Tx', async () => {
      try {
        sandbox.stub(uut.ar, 'issueTx').resolves('sometxid')

        const amountToBurn = 200
        const assetID = mockData.arepaUtxoJSON.assetID
        const utxos = [mockData.utxoJSON, mockData.arepaUtxoJSON]

        const txid = await uut.burnTokens(
          amountToBurn,
          assetID,
          mockData.mockWallet,
          utxos
        )

        assert.equal(txid, 'sometxid')
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected result')
      }
    })
  })
})
