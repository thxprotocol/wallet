const THXToken = artifacts.require('./THXToken.sol')
// const Escrow = artifacts.require('./escrow/Escrow.sol')

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(THXToken)
}
