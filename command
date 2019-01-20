const accounts = await web3.eth.getAccounts()

var token = await THXToken.at(THXToken.address)
token.mint(accounts[0], 1000)
(await token.balanceOf(accounts[0])).toString(10)
(await token.balanceOf(RewardPool.address)).toString(10)

(await token.allowance(accounts[0], RewardPool.address)).toString(10)
// Approve the token transaction.
token.approve(RewardPool.address, 100)
// Transfer the tokens from the sender to the pool
token.transferFrom(accounts[0], RewardPool.address, 100)

var pool = await RewardPool.at(RewardPool.address)
pool.deposit(50)

pool.approveDeposit(50)
pool.transferDeposit(50)

(await token.allowance(RewardPool.address, accounts[0])).toString(10)
