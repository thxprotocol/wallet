const THXToken = artifacts.require('./THXToken.sol')
const Escrow = artifacts.require('./escrow/Escrow.sol')

module.exports = async (deployer) => {
  await deployer.deploy(THXToken)
  // await deployer.deploy(Escrow)
}
