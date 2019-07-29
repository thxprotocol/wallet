const Migrations = artifacts.require('./Migrations.sol');

module.exports = function(deployer) {
    console.log('Migration starts...')
    deployer.deploy(Migrations)
}
