import NetworkService from './NetworkService';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));

export default class ContractService extends NetworkService {

    mint(address, amount) {
        const tokenAmount = new BN(amount).mul(tokenMultiplier);
        const contractAddress = this.instances.tokenRinkeby._address;
        const data = this.instances.tokenRinkeby.methods.mint(address, tokenAmount.toString()).encodeABI();

        return this._signContractMethod(contractAddress, data, this.ethPrivateKey).then((rawTx) => {
            this._sendSignedTransaction(rawTx.rawTransaction);
        });
    }

    async _signContractMethod(to, data) {
        return await this.ethWeb3.eth.accounts.signTransaction({
            chainId: this.ethNetworkId,
            to: to,
            data: data,
            gas: 210000,
        }, this.ethPrivateKey);
    }

    async _sendSignedTransaction(tx) {
        return await this.ethWeb3.eth.sendSignedTransaction(tx)
            .on('transactionHash', (t) => {
                console.log(t);
            })
            .on('receipt', (r) => {
                console.info(r);
            })
            .on('confirmation', (l) => {
                console.info(l);
            })
            .on('error', (e) => {
                console.error(e);
            });
    }
}
