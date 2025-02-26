import { ethers } from 'hardhat'

const Configs = {
  Owner: process.env.OWNER ?? null,
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

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const balance0 = await ethers.provider.getBalance(deployer.address)

  const owner = Configs.Owner ? Configs.Owner : deployer.address

  const token = await ethers.deployContract('ZypherNetworkToken', [owner])
  await token.waitForDeployment()

  const tx = await ethers.provider.getTransaction(token.deploymentTransaction()!.hash)
  const blockNumber = tx?.blockNumber ?? 0
  console.log(`ZypherNetworkToken deployed at block ${blockNumber}`)

  const balance1 = await ethers.provider.getBalance(deployer.address)
  console.log('ZypherNetworkToken deployed to:', token.target)
  console.log('Gas used for deployment:', ethers.formatEther(balance0 - balance1), 'ETH')

  DeployLog.address = token.target as `0x${string}`
  DeployLog.name = await token.name()
  DeployLog.symbol = await token.symbol()
  DeployLog.decimals = Number(await token.decimals())
  DeployLog.owner = await token.owner()
  DeployLog.startBlock = blockNumber
  DeployLog.deployer = deployer.address

  console.log(`Deploy Log: \n${JSON.stringify(DeployLog, null, 2)}`)
}

main()
  .then(() => {
    console.log('Deployment script executed successfully.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error executing deployment script:', error)
    process.exit(1)
  })
