/* Avalanche networks definitions */

'use strict'

const networks = {
  mainnet: {
    host: 'api.avax.network',
    port: 443,
    networkID: 1,
    avaxID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
    explorer: 'explorer.avax.network',
    explorerAPI: 'explorerapi.avax.network'
  },
  fuji: {
    host: 'api.avax-test.network',
    port: 443,
    networkID: 5,
    avaxID: 'U8iRqJoiJm8xZHAacmvYyZVwqQx6uDNtQeP3CQ6fcgQk3JqnK',
    explorer: 'explorer.avax-test.network',
    explorerAPI: 'explorerapi.avax-test.network'
  }
}

module.exports = networks
