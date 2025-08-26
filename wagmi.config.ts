import { defineConfig } from '@wagmi/cli'
import { hardhat } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'deploys/ZypherToken.wagmi.ts',
  contracts: [],
  plugins: [
    hardhat({
      include: ['ZypherNetworkToken.json'],
      project: '.',
    }),
  ],
})
