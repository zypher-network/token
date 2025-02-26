/**
 * @fileOverview
 * This configuration file extends the default Hardhat configuration.
 *
 * It overrides the default network to use the Hardhat network to avoid
 * using wallet information from the environment variables.
 */
import config from './hardhat.config'

export default {
  ...config,
  defaultNetwork: 'hardhat',
}
