const THXToken = artifacts.require('./THXToken.sol')
const RewardPool = artifacts.require('./RewardPool.sol')

const gatewayAddress = '0xe754d9518bf4a9c63476891ef9AA7d91C8236A5D'

module.exports = function(deployer, network, accounts) {
    if (network === 'rinkeby') {
        return
    }

    deployer.then(async () => {
        await deployer.deploy(THXToken, gatewayAddress)
        const THXTokenInstance = await THXToken.deployed()

        await deployer.deploy(RewardPool, "Volunteers United", THXTokenInstance.address);
        const RewardPoolInstance = await RewardPool.deployed();

        console.log('\n*************************************************************************\n')
        console.log(`Deployment account: ${accounts[0]}`)
        console.log(`THXToken Contract Address: ${THXTokenInstance.address}`)
        console.log(`RewardPool Contract Address: ${RewardPoolInstance.address}`)
        console.log('\n*************************************************************************\n')
    })
}
