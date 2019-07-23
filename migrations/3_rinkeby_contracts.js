const THXTokenRinkeby = artifacts.require('./THXTokenRinkeby.sol')

module.exports = async (deployer, network, accounts) => {
    if (network !== 'rinkeby') {
        return
    }

    await deployer.deploy(THXTokenRinkeby);
    const THXTokenRinkebyInstance = await THXTokenRinkeby.deployed()

    console.log('\n*************************************************************************\n')
    console.log(`THXToken Contract Rinkeby Address: ${THXTokenRinkebyInstance.address}`)
    console.log('\n*************************************************************************\n')
}
