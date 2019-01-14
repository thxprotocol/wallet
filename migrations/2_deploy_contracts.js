const THXToken = artifacts.require("THXToken");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(THXToken, _listener = '', _owners = [], manager = accounts[0]);
};
