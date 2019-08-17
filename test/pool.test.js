const THXToken = artifacts.require('THXToken');
const RewardPool = artifacts.require('RewardPool');
const RewardJSON = require('../src/contracts/Reward.json');

const helper = require('ganache-time-traveler');

const config = {
    seconds: {
        day: 86400,
        week: 604800
    },
    reward: {
        amount: web3.utils.toWei('200', 'ether'),
        slug: 'complete_profile'
    }
}

contract('Reward Pool', accounts => {
    let token, tokenInstance, pool, poolInstance, snapShot, snapshotId;

    beforeEach('setup contract for each test', async () => {
        tokenInstance = await THXToken.deployed();
        poolInstance = await RewardPool.deployed();
        token = await THXToken.at(tokenInstance.address);
        pool = await RewardPool.at(poolInstance.address);
    });

    it('The THXToken contract should have an address', () => {
        assert(token.address, 'THXToken has no address');
    });

    it('The RewardPool contract should have an address', () => {
        assert(pool.address, 'RewardPool has no address');
    });

    it('A manager should be able to add another member.', async () => {
        let isAccount0Member, isAccount1Member;

        isAccount0Member = await pool.isMember(accounts[0]);

        await pool.addMember(accounts[1], {from: accounts[0]});

        isAccount1Member = await pool.isMember(accounts[1]);

        assert(isAccount0Member, 'Account 0 is not a member');
        assert(isAccount1Member, 'Account 1 is not a member');
    });

    it('A minter should be able to mint 100000 THX.', async () => {
        let isAccount0Minter, balanceBefore, balanceAfter, amount, balance;

        isAccount0Minter = await token.isMinter(accounts[0]);
        balanceBefore = await token.balanceOf(accounts[0]);
        amount = web3.utils.toWei('100000', 'ether');

        await token.mint(accounts[0], amount, {from: accounts[0]});

        balanceAfter = await token.balanceOf(accounts[0]);
        balance = web3.utils.fromWei(balanceAfter, 'ether');

        assert(isAccount0Minter, 'Account is not a minter');
        assert(parseInt(balanceAfter) > parseInt(balanceBefore), 'Balance should be higher than before.');
        assert(balance === '100000', 'Balance should be higher than before.');
    });

    it('Anyone should be able to deposit 1000 THX to the pool.', async () => {
        let balanceBefore, balanceAfter, amount, balance;

        balanceBefore = await token.balanceOf(pool.address);
        amount = web3.utils.toWei('1000', 'ether');

        await pool.deposit(amount, {from: accounts[0]});

        balanceAfter = await token.balanceOf(pool.address);
        balance = web3.utils.fromWei(balanceAfter, 'ether');
        console.log(balance)
        assert(parseInt(balanceAfter) > parseInt(balanceBefore), 'Pool balance should be higher than before.');
        assert(balance === '1000', 'Pool balance should equal 1000');
    });

    it('The contract should assign correct manager roles', async () => {
        const isAccount0Manager = await pool.isManager(accounts[0]);
        const isAccount1Manager = await pool.isManager(accounts[1]);

        assert(isAccount0Manager, 'Account is not a manager');
        assert(!isAccount1Manager, 'Account is a manager');
    });

    it("A manager should be able to create a reward rule", async () => {
        let amountOfRulesBefore, amountOfRulesAfter;

        amountOfRulesBefore = parseInt(await pool.countRules());

        await pool.createRule(config.reward.slug, config.reward.amount, {from: accounts[0]});

        amountOfRulesAfter = parseInt(await pool.countRules());

        assert(amountOfRulesAfter > amountOfRulesBefore, "Amount of rules should have increased with 1.")
    });

    it("A member should be able to claim a reward", async () => {
        let lastRewardRuleId, amountOfRewardsBefore, amountOfRewardsAfter, rule;

        lastRewardRuleId = parseInt((await pool.countRules()) - 1);

        rule = await pool.rules(lastRewardRuleId);

        amountOfRewardsBefore = parseInt(await pool.countRewards());

        await pool.createReward(rule.id, { from: accounts[1] });

        amountOfRewardsAfter = parseInt(await pool.countRewards());

        assert(amountOfRewardsAfter > amountOfRewardsBefore, "Amount of rewards should have increased.")
    });

    it("A manager should be able to vote yes on a reward payout", async () => {
        let lastRewardId, rewardAddress, rewardContract, vote, yesVotes;

        lastRewardId = parseInt((await pool.countRewards()) - 1);

        await pool.voteForReward(lastRewardId, true, {from: accounts[0]});

        rewardAddress = await pool.rewards(lastRewardId);
        rewardContract = new web3.eth.Contract(RewardJSON.abi, rewardAddress, {from: accounts[0]});
        vote = await rewardContract.methods.votesByAddress(accounts[0]).call();
        yesVotes = await rewardContract.methods.yesCounter().call();

        assert(parseInt(vote.time) > 0, 'Vote time is not larger than 0.')
        assert(parseInt(yesVotes) > 0, 'Vote yes counter is not larger than 0.')
    });


    it("A manager should be able to revoke it's vote on a reward payout", async () => {
        let lastRewardId, rewardAddress, rewardContract, vote, yesVotes;

        lastRewardId = parseInt((await pool.countRewards()) - 1);

        await pool.revokeVoteForReward(lastRewardId, {from: accounts[0]});

        rewardAddress = await pool.rewards(lastRewardId);
        rewardContract = new web3.eth.Contract(RewardJSON.abi, rewardAddress, {from: accounts[0]});
        vote = await rewardContract.methods.votesByAddress(accounts[0]).call();
        yesVotes = await rewardContract.methods.yesCounter().call();

        console.log(yesVotes);

        assert(parseInt(vote.time) == 0, 'Vote time is not reset to 0.')
        assert(parseInt(yesVotes) == 0, 'Vote yes counter is larger than 0.')
    });

    it("Anyone should be able to finalize the reward poll", async () => {
        let now, future, lastRewardId, rewardAddress, rewardContract, endTime, finalized;

        lastRewardId = parseInt((await pool.countRewards()) - 1);
        rewardAddress = await pool.rewards(lastRewardId);
        rewardContract = new web3.eth.Contract(RewardJSON.abi, rewardAddress, {from: accounts[0]});

        await pool.voteForReward(lastRewardId, true, {from: accounts[0]});

        vote = await rewardContract.methods.votesByAddress(accounts[0]).call();
        yesVotes = await rewardContract.methods.yesCounter().call();
        noVotes = await rewardContract.methods.noCounter().call();

        console.log(vote)
        console.log(yesVotes)
        console.log(noVotes)

        endTime = parseInt(await rewardContract.methods.endTime().call());
        now = (await web3.eth.getBlock('latest')).timestamp;

        await helper.advanceTimeAndBlock(endTime - now);
        console.log(`
            Time: ${new Date(now * 1000)} \n
            Time: ${new Date(endTime * 1000)}.
        `);

        balanceBefore = await token.balanceOf(accounts[1]);
        console.log(web3.utils.fromWei(balanceBefore, 'ether'));

        finalized = await rewardContract.methods.finalized().call();
        console.log(finalized);

        const approved = await rewardContract.methods.isNowApproved().call();
        console.log(approved);

        await rewardContract.methods.tryToFinalize().send({ from: accounts[0] });

        finalized = await rewardContract.methods.finalized().call();
        console.log(finalized);

        balanceAfter = await token.balanceOf(accounts[1]);
        console.log(accounts[1])
        console.log(web3.utils.fromWei(balanceAfter, 'ether'));

        poolBalance = await token.balanceOf(pool.address);
        balance = web3.utils.fromWei(poolBalance, 'ether');
        console.log(balance)

        assert(parseInt(balanceAfter) > parseInt(balanceBefore), 'Balance should be higher than before.');
    });
});
