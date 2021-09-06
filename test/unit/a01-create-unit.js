/*
  Unit tests for the create.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

const { Avalanche, BinTools } = require('avalanche')

const CreateLib = require('../../lib/create')
/** @type {CreateLib} */
let uut // Unit Under Test

describe('#CreateLib', () => {
  let sandbox

  // Restore the sandbox before each test.
  beforeEach(() => {
    sandbox = sinon.createSandbox()

    const config = {
      ava: new Avalanche('api.avax.network', 443, 'https'),
      binTools: BinTools.getInstance()
    }

    uut = new CreateLib(config)
  })

  afterEach(() => sandbox.restore())

  describe('#fromMnemonic', () => {
    it('should throw an error if the passed value is not a string or its empty', async () => {
      try {
        await uut.fromMnemonic()
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'invalid parameter')
      }
    })

    it('should throw an error if the passed value is not a valid mnemonic phrase', async () => {
      try {
        await uut.fromMnemonic('some words that arent a valid key')
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'invalid mnemonic')
      }
    })

    it('should return a formated walled with type mnemonic', async () => {
      try {
        const mnemonic = 'humor nature regret save degree lobster debris vocal cook dash switch ' +
          'try fluid sleep evil mosquito muscle race race nuclear foam toss gadget nominee'
        const wallet = await uut.fromMnemonic(mnemonic)
        assert.hasAllKeys(wallet, [
          'type',
          'mnemonic',
          'address',
          'privateKey',
          'publicKey',
          'avax'
        ])
        assert.equal(wallet.address, 'X-avax1v6hutycdrl5xys8g2hxqxltktx5ty5j0reyx45')
        assert.equal(wallet.type, 'mnemonic')
        assert.equal(wallet.mnemonic, mnemonic)
      } catch (err) {
        console.log(err)
        assert.fail('Unexpected code path')
      }
    })
  })

  describe('#fromPrivateKey', () => {
    it('should throw an error if the passed value is not a string or its empty', async () => {
      try {
        await uut.fromPrivateKey()
        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'invalid private Key')
      }
    })

    it('should return a formated walled with type privateKey', async () => {
      try {
        const wallet = await uut.fromPrivateKey('PrivateKey-23E9Ttdziouo9m2V55vwVE8fnhNkCCdpGdoC7HfDmti5f4yShv')
        assert.hasAllKeys(wallet, [
          'type',
          'mnemonic',
          'address',
          'privateKey',
          'publicKey',
          'avax'
        ])

        assert.equal(wallet.address, 'X-avax1u6pvrj20s7vjw0j9mc5ms2as7wdan77z2e9a27')
        assert.equal(wallet.type, 'privateKey')
        assert.equal(wallet.mnemonic, '')
      } catch (err) {
        assert.fail('Unexpected result')
      }
    })

    it('should work even if the word private key is missing', async () => {
      try {
        const wallet = await uut.fromPrivateKey('23E9Ttdziouo9m2V55vwVE8fnhNkCCdpGdoC7HfDmti5f4yShv')

        assert.equal(wallet.address, 'X-avax1u6pvrj20s7vjw0j9mc5ms2as7wdan77z2e9a27')
      } catch (err) {
        assert.fail('Unexpected result')
      }
    })
  })

  describe('#checkString', () => {
    it('should return false if the argument is null', async () => {
      try {
        const res = await uut.checkString()
        assert.isFalse(res)
      } catch (err) {
        assert.fail('Unexpected result')
      }
    })

    it('should return false if mnemonic phrase is passed', async () => {
      try {
        const mnemonic = 'humor nature regret save degree lobster debris vocal cook dash switch ' +
          'try fluid sleep evil mosquito muscle race race nuclear foam toss gadget nominee'
        const res = await uut.checkString(mnemonic)
        assert.isFalse(res)
      } catch (err) {
        assert.fail('Unexpected result')
      }
    })

    it('should return true if private key is passed', async () => {
      try {
        const res = await uut.checkString('PrivateKey-23E9Ttdziouo9m2V55vwVE8fnhNkCCdpGdoC7HfDmti5f4yShv')
        assert.isTrue(res)
      } catch (err) {
        assert.fail('Unexpected result')
      }
    })

    // neither mnemonic nor private
    it('should return false if invalid parameter is passed', async () => {
      try {
        const res = await uut.checkString('cañonshouldntwork')
        assert.isFalse(res)
      } catch (err) {
        assert.fail('Unexpected result')
      }
    })
  })
})
