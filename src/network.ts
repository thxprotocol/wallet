import Matic from '@maticnetwork/maticjs';
import HDWalletProvider from '@truffle/hdwallet-provider';

export const config = {
    root: {
        RPC: 'https://goerli.infura.io/v3/' + process.env.VUE_APP_INFURA_KEY,
        POSRootChainManager: '0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74',
        DERC20: '0x655F2166b0709cd575202630952D71E2bB0d61Af',
        posERC20Predicate: '0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34',
        posEtherPredicate: '0xe2B01f3978c03D6DdA5aE36b2f3Ac0d66C54a6D5',
    },
    child: {
        RPC: 'https://rpc-mumbai.matic.today',
        DERC20: '0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1',
        MaticWETH: '0x714550C2C1Ea08688607D86ed8EeF4f5E4F22323',
    },
    user: {
        privateKey: process.env.VUE_APP_USER_PRIVATE_KEY || '',
        address: process.env.VUE_APP_USER_ADDRESS || '',
        amount: '2000000000000000000', // 0.00005
        amount2: '70000000000000000000', // 0.00007
        tokenId: '1234',
        tokenId2: '6789',
    },
};

export const maticPOSClient = new Matic.MaticPOSClient({
    network: 'testnet',
    version: 'mumbai',
    parentProvider: new HDWalletProvider(config.user.privateKey, config.root.RPC),
    maticProvider: new HDWalletProvider(config.user.privateKey, config.child.RPC),
    posRootChainManager: config.root.POSRootChainManager,
    posERC20Predicate: config.root.posERC20Predicate,
    parentDefaultOptions: { from: config.user.address },
    maticDefaultOptions: { from: config.user.address },
});
