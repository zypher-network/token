import { defineConfig } from '@wagmi/cli'
import { hardhat } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'dist/TsClient.wagmi.ts',
  contracts: [],
  plugins: [
    hardhat({
      include: ['ZgClient.json'],
      project: '.',
    }),
  ],
})
