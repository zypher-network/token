import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import type { Address } from 'viem'

import deploy from './ZypherNetworkToken.fixtures'

describe('ZypherNetworkToken', function () {
  it('should deploy as well as testnet deploying script', async function () {
    const [deployer, initOwner] = await ethers.getSigners()

    const token = await loadFixture(deploy({
      OWNER: initOwner.address as Address,
    }))

    expect(await token.owner()).to.equal(initOwner.address)

    // Deployer (non-owner) should not be able to mint
    await expect(token.mint(initOwner.address, 1n))
      .to.revertedWithCustomError(token, 'OwnableUnauthorizedAccount')
      .withArgs(deployer.address)

    // Actual owner should be able to mint
    await expect(token.connect(initOwner).mint(initOwner.address, 1n))
      .to.emit(token, 'Transfer')
      .withArgs(ethers.ZeroAddress, initOwner.address, 1n)
  })

  it('should respect the cap on minting', async function () {
    const [admin, holder, other] = await ethers.getSigners()

    const token = await loadFixture(deploy())
    const cap = await token.cap()

    // Make sure the cap is set to 10 billion tokens
    expect(cap).to.eq(
      ethers.parseEther((10_000_000_000).toString()),
      'Cap should be 10 billion tokens'
    )

    await expect(token.mint(holder.address, 1n))
      .to.emit(token, 'Transfer')
      .withArgs(ethers.ZeroAddress, holder.address, 1n)

    // Unable to mint more than cap
    await expect(token.mint(holder.address, cap))
      .to.be.revertedWithCustomError(token, 'ERC20ExceededCap')
      .withArgs(cap + 1n, cap)

    // Clear the balance by burning
    await token.connect(holder).burn(1n)
    expect(await token.totalSupply()).to.equal(0n)

    // 10% of cap to holder 1
    await expect(token.mint(holder.address, cap / 10n))
      .to.emit(token, 'Transfer')
      .withArgs(ethers.ZeroAddress, holder.address, cap / 10n)

    // 90% of cap to other
    await expect(token.mint(other.address, cap * 9n / 10n))
      .to.emit(token, 'Transfer')
      .withArgs(ethers.ZeroAddress, other.address, cap * 9n / 10n)

    expect(await token.totalSupply()).to.equal(cap)

    // Cannot mint more than cap
    await expect(token.mint(admin.address, 1n))
      .to.be.revertedWithCustomError(token, 'ERC20ExceededCap')
      .withArgs(cap + 1n, cap)
  })
})
