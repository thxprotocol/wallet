const THXToken = artifacts.require('./THXToken.sol')
const RewardPool = artifacts.require('./RewardPool.sol')

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(THXToken)
  await deployer.deploy(RewardPool, "Volunteers United", THXToken.address)
}
