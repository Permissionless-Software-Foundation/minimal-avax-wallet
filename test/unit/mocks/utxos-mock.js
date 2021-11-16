
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
  assetID: avaxIDBuffer,
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

const arepaUtxoJSON = {
  txid: '2qD6DQHDgs7xorUaqgWQRgoQSoQL6zRDhLe1NqpbfQVz29dnWc',
  outputIdx: '00000000',
  amount: 390,
  assetID: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5',
  typeID: 7
}

const mockWallet = {
  privateKey: 'PrivateKey-23E9Ttdziouo9m2V55vwVE8fnhNkCCdpGdoC7HfDmti5f4yShv',
  address: 'X-avax1u6pvrj20s7vjw0j9mc5ms2as7wdan77z2e9a27'
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

const transactions = [
  {
    id: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
    chainID: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
    type: 'operation',
    acceptedAt: '2021-03-24T23:56:13.328Z',
    inputs: [
      {
        output: {
          id: '2uWp4MeXZiwECx2wH3Aig43BHiydBdSSTGBLHYZPSD5E8WT1sj',
          transactionID: 'sBCUA6c7NY1jDRgb24R2K7zKQT7FxVZpWtSRazt92ozZRpJRB',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '100000000',
          addresses: [addressString]
        }
      }
    ],
    outputs: [
      {
        id: 'QGFmhRGYHNbWMLhEVqMTTUcbXa7N6zGHnr4weQNKPaDkYpqNY',
        transactionID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        outputType: 7,
        amount: '90000000',
        addresses: [addressString]
      },
      {
        id: 'rW4yn7BgdEznfbzfJXmBB2RFKwCYZS2TR72gjw9Tx78cdPM9C',
        transactionID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 6,
        amount: '1',
        addresses: [addressString]
      },
      {
        id: 'FE5p8PxHpkHwyg7QvWzTDHBmVyvuN1cYtX8JLnPofD6zTdjFq',
        transactionID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 7,
        amount: '100',
        addresses: [addressString]
      }
    ]
  },
  {
    id: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
    chainID: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
    type: 'X_BASE_TRANSACTION',
    acceptedAt: '2021-04-01T03:21:03.112Z',
    memo: null,
    inputs: [
      {
        output: {
          id: 'c5pHB1fkdW2R9dyULPThafDCPsycjEMbFFDHRssQNaGe9krpr',
          transactionID: 'Byo1Brzg5Sg9p73o2Mv5Yd2P5GPJLYetMWVtwSL2j3AHVkRAA',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '1000000',
          addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
        }
      },
      {
        output: {
          id: '2n9VoKT5ihnz3VNEd3sKhExeHWP9iEKrknN8eKYQnH9eF3bsmw',
          transactionID: 'ZpijU3ujGz5bgzhRwnbEivdtHYQ1sKWXTKfHH5WCTNQkM3emk',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '84000000',
          addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
        }
      }
    ],
    outputs: [
      {
        id: 'eYfVtuFUNvtNN3ro3SWTfwRiRKmok82Ce2hYd8N9N1n9vabCw',
        transactionID: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
        assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        outputType: 7,
        amount: '1000000',
        addresses: [addressString]
      },
      {
        id: '21aeW38LP5ri9aik4Xvsv8i227gMVbsHnxYMzAnXdrMZ7X9sDF',
        transactionID: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
        assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        outputType: 7,
        amount: '83000000',
        addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
      }
    ]
  },
  {
    id: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
    chainID: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
    type: 'base',
    acceptedAt: '2021-04-02T02:02:18.738Z',
    memo: 'ABJTY3JpcHQgdG8gbWludCBBTlQ=',
    inputs: [
      {
        output: {
          id: 'QGFmhRGYHNbWMLhEVqMTTUcbXa7N6zGHnr4weQNKPaDkYpqNY',
          transactionID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '90000000',
          addresses: [addressString]
        }
      },
      {
        output: {
          id: 'rW4yn7BgdEznfbzfJXmBB2RFKwCYZS2TR72gjw9Tx78cdPM9C',
          transactionID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
          assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
          amount: '1',
          addresses: [addressString]
        }
      }
    ],
    outputs: [
      {
        id: '2pYGGiAu4RyF94JTfBPexvWuKQsbBKFBocfFroR3GM8w1H2ou9',
        transactionID: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
        assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        outputType: 7,
        amount: '89000000',
        addresses: [addressString]
      },
      {
        id: 'gpW3AtnmNNRKqcbcS4ZHguvT5JG2QJKaUHGvRHwzFusPyFq8C',
        transactionID: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 6,
        amount: '1',
        addresses: [addressString]
      },
      {
        id: '2eznNoGo32invTUMpmFfCMvQMF1STWj9nwtiyjzGJwSW9Ykmbu',
        transactionID: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 7,
        amount: '1000',
        addresses: [addressString]
      }
    ]
  },
  {
    id: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
    chainID: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
    type: 'base',
    acceptedAt: '2021-04-02T02:13:27.376Z',
    memo: 'ABJTY3JpcHQgdG8gbWludCBBTlQ=',
    inputs: [
      {
        output: {
          id: 'eYfVtuFUNvtNN3ro3SWTfwRiRKmok82Ce2hYd8N9N1n9vabCw',
          transactionID: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '1000000',
          addresses: [addressString]
        }
      },
      {
        output: {
          id: 'gpW3AtnmNNRKqcbcS4ZHguvT5JG2QJKaUHGvRHwzFusPyFq8C',
          transactionID: '2FznNpHKf5MkTaY7nSCJYr599rga8m5vEhAHFzSQvgZqQcc38R',
          assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
          amount: '1',
          addresses: [addressString]
        }
      }
    ],
    outputs: [
      {
        id: 'XUVTMWmcxVxj55Vwar6RXcTwLPdh8Lgpk4BKwBNKjAd3abPrk',
        transactionID: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 6,
        amount: '1',
        addresses: [addressString]
      },
      {
        id: '2UWicCfoXfsfxZQECiSxg8oTh1v8fj4EK6aJ1yNtEpkWJfYK6i',
        transactionID: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9'],
        outputType: 7,
        amount: '100'
      }
    ]
  },
  {
    id: 'dcJHY4aUHboSVhqNtDcw2SNaufLkgLZARNkAioYC1gh6nWpPF',
    chainID: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
    type: 'base',
    acceptedAt: '2021-04-02T02:19:54.680Z',
    memo: 'QkNIIGJpdGNvaW5jYXNoOnF6bnAwbmVrZ21haGtxd3Y1NHp2cTQzM3RteGVydHdzNXN3Z3gybmNkaA==',
    inputs: [
      {
        output: {
          id: '2UWicCfoXfsfxZQECiSxg8oTh1v8fj4EK6aJ1yNtEpkWJfYK6i',
          transactionID: '2MSyPCcB6Bz2sqxsifCJnVNVTFrHW4D4gFRa6LeRkgEwgRjLkC',
          assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
          amount: '100',
          addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
        }
      },
      {
        output: {
          id: '21aeW38LP5ri9aik4Xvsv8i227gMVbsHnxYMzAnXdrMZ7X9sDF',
          transactionID: '2st8315DNQkSY4cAEfdHGC7BW7myvK3yXretSjuHXEV8oCv8AG',
          assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
          amount: '83000000',
          addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
        }
      }
    ],
    outputs: [
      {
        id: '2cWYBQzsCnwCzXv3tgDjyB3jrzGfTPnAhEY9HLvaQdbZHEmuFh',
        transactionID: 'dcJHY4aUHboSVhqNtDcw2SNaufLkgLZARNkAioYC1gh6nWpPF',
        assetID: 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        outputType: 7,
        amount: '82000000',
        addresses: ['avax1xasw9kra42luktrckgc8z3hsgzme7h4ck6r4s9']
      },
      {
        id: '2niNWsF2FmzKCMpRobkHR5c7BU3MoyqUQDa1aw9Lm5FAWnECWU',
        transactionID: 'dcJHY4aUHboSVhqNtDcw2SNaufLkgLZARNkAioYC1gh6nWpPF',
        assetID: '2tEi6r6PZ9VXHogUmkCzvijmW81TRNjtKWnR4FA55zTPc87fxC',
        outputType: 7,
        amount: '100',
        addresses: [addressString]
      }
    ]
  }
]

module.exports = {
  utxoSet,
  balances,
  assetDescription,
  addressString,
  avaxID,
  utxoJSON,
  transactions,
  arepaUtxoJSON,
  mockWallet,
  txid
}
