const THXTokenRinkeby = artifacts.require('./THXTokenRinkeby.sol')

module.exports = function(deployer, network, accounts) {
    if (network !== 'rinkeby') {
        return
    }
    
    deployer.then(async () => {
        await deployer.deploy(THXTokenRinkeby)
        const THXTokenRinkebyInstance = await THXTokenRinkeby.deployed()

        console.log('\n*************************************************************************\n')
        console.log(`THXToken Contract Rinkeby Address: ${THXTokenRinkebyInstance.address}`)
        console.log('\n*************************************************************************\n')
    });
}
