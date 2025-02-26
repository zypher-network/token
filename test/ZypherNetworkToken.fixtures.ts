import { ethers } from 'hardhat'
import Debug from 'debug'

import type { Address } from 'viem'

type ENV = {
  OWNER?: Address
}

const logger = Debug('test')

export const deployScript = (Env: ENV = {}) => {
  const Configs = {
    Owner: Env.OWNER ?? null,
  }

  const DeployLog = {
    address: '',
    startBlock: 0,
    name: '',
    symbol: '',
    decimals: 0,
    owner: '',
    deployer: '',
  }

  logger.extend('deployScript')('Configs: %o', Configs)

  return async function deployZypherNetworkToken() {
    const debug = logger.extend('deployZypherNetworkToken')
    const [deployer] = await ethers.getSigners()
    debug('Deploying contracts with the account: %s', deployer.address)

    const owner = Configs.Owner ? Configs.Owner : deployer.address

    const token = await ethers.deployContract('ZypherNetworkToken', [owner])
    await token.waitForDeployment()

    const tx = await ethers.provider.getTransaction(token.deploymentTransaction()!.hash)
    const blockNumber = tx?.blockNumber ?? 0
    debug('ZypherNetworkToken deployed at block %d', blockNumber)
    debug('ZypherNetworkToken deployed to: %s', token.target)

    DeployLog.address = token.target as Address
    DeployLog.name = await token.name()
    DeployLog.symbol = await token.symbol()
    DeployLog.decimals = Number(await token.decimals())
    DeployLog.owner = await token.owner()
    DeployLog.startBlock = blockNumber
    DeployLog.deployer = deployer.address

    debug('Deploy Log: %o', DeployLog)

    return token
  }
}

export default deployScript
