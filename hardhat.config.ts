import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import Debug from 'debug'
import { config as dotenvConfig } from 'dotenv'
import { parseEther } from 'ethers'
import 'hardhat-abi-exporter'
import type { HardhatUserConfig } from 'hardhat/config'
import type { HttpNetworkAccountsUserConfig } from 'hardhat/types'

const debug = Debug('app:config')
const env = dotenvConfig()

if (env.error) debug('Failed to load .env file')

const Params = {
  DefaultNetwork: process.env.DEFAULT_NETWORK ?? 'hardhat',
  PrivateKey: process.env.PRIVATE_KEY ?? process.env.KEY ?? '',
  MnemonicPhrase: process.env.MNEMONIC_PHRASE ?? process.env.MNEMONIC ?? '',
  MnemonicPath: process.env.MNEMONIC_PATH ?? `m/44'/60'/0'/0/`,
  MnemonicPassword: process.env.MNEMONIC_PASSWORD ?? '',
  MnemonicInitialIndex: parseInt(process.env.MNEMONIC_INITIAL_INDEX ?? '0', 10) || 0,
  ReportGas: Boolean(process.env.REPORT_GAS),
  DefaultMnemonic: 'test test test test test test test test test test test junk',
} as const

const accounts = parseAccounts(Params)

const infuraKey = process.env.INFURA_KEY ?? null
const hasInfuraKey = Boolean(infuraKey && infuraKey.length > 0)

const config: HardhatUserConfig = {
  defaultNetwork: Params.DefaultNetwork,
  networks: {
    hardhat: {
      accounts: {
        mnemonic: Params.DefaultMnemonic,
        accountsBalance: `${parseEther('1000000')}`,
      },
      chainId: 31_337,
    },

    'ethereum:mainnet': {
      accounts,
      chainId: 1,
      url: hasInfuraKey
        ? `https://mainnet.infura.io/v3/${infuraKey}`
        : `https://eth.llamarpc.com`,
    },
    'ethereum:sepolia': {
      accounts,
      chainId: 11155111,
      url: hasInfuraKey
        ? `https://sepolia.infura.io/v3/${infuraKey}`
        : `https://ethereum-sepolia-rpc.publicnode.com`,
    },

    'bnb:testnet': {
      accounts,
      chainId: 97,
      url: hasInfuraKey
        ? `https://bsc-testnet.infura.io/v3/${infuraKey}`
        : 'https://bsc-testnet-rpc.publicnode.com',
    },
    'bnb:mainnet': {
      accounts,
      chainId: 56,
      url: hasInfuraKey
        ? `https://bsc-mainnet.infura.io/v3/${infuraKey}`
        : 'https://bsc-dataseed.binance.org',
    },

    'zytron:mainnet': {
      accounts,
      chainId: 9_901,
      url: `https://rpc.zypher.network`,
    },

    // hardhat node
    local: {
      accounts: {
        mnemonic: Params.DefaultMnemonic,
      },
      chainId: 31_337,
      url: 'http://127.0.0.1:8545',
    },
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.28',
        settings: {
          metadata: {
            // Not including the metadata hash
            // https://github.com/paulrberg/solidity-template/issues/31
            bytecodeHash: 'none',
          },
          // Disable the optimizer when debugging
          // https://hardhat.org/hardhat-network/#solidity-optimizer-support
          optimizer: {
            enabled: true,
            runs: 200,
          },
          // evmVersion: 'default',
        },
      },
    ],
  },

  mocha: {
    bail: true,
  },

  abiExporter: {
    path: './build/abi',
    format: 'json',
    spacing: 2,
    clear: true,
    flat: true,
  },

  typechain: {
    outDir: 'build/types',
    target: 'ethers-v6',
  },

  gasReporter: {
    currency: 'USD',
    enabled: Params.ReportGas,
    excludeContracts: [],
  },
}

export default config

function parseAccounts(params: typeof Params): HttpNetworkAccountsUserConfig {
  if (params.MnemonicPhrase)
    return {
      mnemonic: params.MnemonicPhrase,
      initialIndex: params.MnemonicInitialIndex,
      count: 10,
      path: params.MnemonicPath,
      passphrase: params.MnemonicPassword,
    }

  if (params.PrivateKey) return [params.PrivateKey]

  debug('No wallet params in env, using default accounts')

  return {
    mnemonic: params.DefaultMnemonic,
    initialIndex: 0,
    count: 10,
  }
}
