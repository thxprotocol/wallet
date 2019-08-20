import NetworkService from './NetworkService';

const BN = require('bn.js');
const tokenMultiplier = new BN(10).pow(new BN(18));
const rinkebyGatewayAddress = '0xb73C9506cb7f4139A4D6Ac81DF1e5b6756Fab7A2';
const gas = 350000;

export default class TransferGateway extends NetworkService {

    async depositToRinkebyGateway(amount) {
        let data, tx;
        const tokenAmount = new BN(amount).mul(tokenMultiplier);
        const token = this.instances.tokenRinkeby;
        const tokenAddress = this.instances.tokenRinkeby._address;
        const gateway = this.instances.gateway;

        data = token.methods.approve(rinkebyGatewayAddress, tokenAmount.toString()).encodeABI();
        tx = await this._signContractMethod(tokenAddress, data);

        await this._sendSignedTransaction(tx.rawTransaction);

        data = gateway.methods.depositERC20(tokenAmount.toString(), tokenAddress).encodeABI();
        tx = await this._signContractMethod(rinkebyGatewayAddress, data);

        return await this._sendSignedTransaction(tx.rawTransaction);
    }

    async mint(address, amount) {
        let tx;
        const tokenAmount = new BN(amount).mul(tokenMultiplier);
        const contractAddress = this.instances.tokenRinkeby._address;
        const data = this.instances.tokenRinkeby.methods.mint(address, tokenAmount.toString()).encodeABI();

        tx = await this._signContractMethod(contractAddress, data);

        return await this._sendSignedTransaction(tx.rawTransaction);
    }

    async _signContractMethod(to, data) {
        return await this.ethWeb3.eth.accounts.signTransaction({
            chainId: this.ethNetworkId,
            to: to,
            data: data,
            gas: gas,
        }, this.ethPrivateKey);
    }

    async _sendSignedTransaction(tx) {
        return await this.ethWeb3.eth.sendSignedTransaction(tx)
            .on('transactionHash', (t) => {
                // eslint-disable-next-line
                console.info(t);
            })
            .on('receipt', (r) => {
                // eslint-disable-next-line
                console.info(r);
            })
            .on('confirmation', (l) => {
                // eslint-disable-next-line
                console.info(l);
            })
            .on('error', (e) => {
                // eslint-disable-next-line
                console.error(e);
            });
    }
}
