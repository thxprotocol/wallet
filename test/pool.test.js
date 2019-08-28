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
    let token, tokenInstance, pool, poolInstance, lastRewardId, rewardAddress, rewardContract;

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

    it('A member should be able to add another member.', async () => {
        let isMemberBefore, isMemberAfter;

        isMemberBefore = await pool.isMember(accounts[1]);

        await pool.addMember(accounts[1], {from: accounts[0]});

        isMemberAfter = await pool.isMember(accounts[1]);

        assert(!isMemberBefore, 'Account was already a member');
        assert(isMemberAfter, 'Account has not become a member');
    });

    it('A manager should be able to add another manager.', async () => {
        let isManagerBefore, isManagerAfter;

        isManagerBefore = await pool.isManager(accounts[2]);

        await pool.addManager(accounts[2], {from: accounts[0]});
        await pool.addManager(accounts[3], {from: accounts[0]});
        await pool.addManager(accounts[4], {from: accounts[0]});

        isManagerAfter = await pool.isManager(accounts[2]);

        assert(!isManagerBefore, 'Account was already a manager');
        assert(isManagerAfter, 'Account has not become a manager');
    });

    it('A minter should be able to mint 10000 THX.', async () => {
        let isAccount0Minter, balanceBefore, balanceAfter, amount, balance;

        isAccount0Minter = await token.isMinter(accounts[0]);
        balanceBefore = await token.balanceOf(accounts[0]);
        amount = web3.utils.toWei('10000', 'ether');

        await token.mint(accounts[0], amount, {from: accounts[0]});

        balanceAfter = await token.balanceOf(accounts[0]);
        balance = web3.utils.fromWei(balanceAfter, 'ether');

        assert(isAccount0Minter, 'Account is not a minter');
        assert(parseInt(balanceAfter) > parseInt(balanceBefore), 'Balance should be higher than before.');
        assert(balance === '10000', 'Balance should be higher than before.');
    });

    it('A user should be able to send 5000 THX.', async () => {
        let isAccount0Minter, balanceBefore, balanceAfter, amount, balance;

        balanceBefore = await token.balanceOf(accounts[1]);
        amount = web3.utils.toWei('1000', 'ether');

        await token.transfer(accounts[1], amount, {from: accounts[0]});
        await token.transfer(accounts[2], amount, {from: accounts[0]});
        await token.transfer(accounts[3], amount, {from: accounts[0]});
        await token.transfer(accounts[4], amount, {from: accounts[0]});

        balanceAfter = await token.balanceOf(accounts[1]);

        assert(parseInt(balanceAfter) > parseInt(balanceBefore), 'Balance of account 1 should be higher than before.');
    });

    it('Anyone should be able to deposit 1000 THX to the pool.', async () => {
        let balanceBefore, balanceAfter, amount, balance;

        balanceBefore = await token.balanceOf(pool.address);
        amount = web3.utils.toWei('1000', 'ether');

        await pool.deposit(amount, {from: accounts[0]});

        balanceAfter = await token.balanceOf(pool.address);
        balance = web3.utils.fromWei(balanceAfter, 'ether');

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

    // TODO Implement reward rule tests here and refactor and split into separate files after.

    it("A member should be able to claim a reward", async () => {
        let lastRewardRuleId, amountOfRewardsBefore, amountOfRewardsAfter, rule;

        lastRewardRuleId = parseInt((await pool.countRules()) - 1);

        rule = await pool.rules(lastRewardRuleId);

        amountOfRewardsBefore = parseInt(await pool.countRewards());

        await pool.createReward(rule.id, { from: accounts[1] });

        amountOfRewardsAfter = parseInt(await pool.countRewards());

        lastRewardId = parseInt(amountOfRewardsAfter - 1);
        rewardAddress = await pool.rewards(lastRewardId);
        rewardContract = new web3.eth.Contract(RewardJSON.abi, rewardAddress, {from: accounts[0]});

        assert(amountOfRewardsAfter > amountOfRewardsBefore, "Amount of rewards should have increased.")
        assert(rewardAddress != "0x0000000000000000000000000000000000000000", "Address of new reward should not be null")
    });

    it("A manager should be able to vote yes on a reward payout", async () => {
        let vote, yesVotes;

        await pool.voteForReward(lastRewardId, true, {from: accounts[0]});

        vote = await rewardContract.methods.votesByAddress(accounts[0]).call();
        yesVotes = await rewardContract.methods.yesCounter().call();

        assert(parseInt(vote.time) > 0, 'Vote time is not larger than 0.')
        assert(parseInt(yesVotes) > 0, 'Vote yes counter is not larger than 0.')
    });


    it("A manager should be able to revoke it's vote on a reward payout", async () => {
        let vote, yesVotes;

        await pool.revokeVoteForReward(lastRewardId, {from: accounts[0]});

        vote = await rewardContract.methods.votesByAddress(accounts[0]).call();
        yesVotes = await rewardContract.methods.yesCounter().call();

        assert(parseInt(vote.time) == 0, 'Vote time is not reset to 0.')
        assert(parseInt(yesVotes) == 0, 'Vote yes counter is larger than 0.')
    });

    it("The manager accounts should be able to vote yes on the reward poll.", async () => {
        let yesVotes, noVotes;

        await pool.voteForReward(lastRewardId, true, {from: accounts[0]});
        await pool.voteForReward(lastRewardId, true, {from: accounts[2]});
        await pool.voteForReward(lastRewardId, true, {from: accounts[3]});
        await pool.voteForReward(lastRewardId, false, {from: accounts[4]});

        yesVotes = await rewardContract.methods.yesCounter().call();
        noVotes = await rewardContract.methods.noCounter().call();

        assert(parseInt(yesVotes) > parseInt(noVotes), "There should be more yes than no votes.");
    });

    it("Anyone should be able to finalize the reward poll", async () => {
        let endTime, now, finalized, approved;

        endTime = parseInt(await rewardContract.methods.endTime().call());
        now = (await web3.eth.getBlock('latest')).timestamp;

        await helper.advanceTimeAndBlock(endTime - now);
        await rewardContract.methods.tryToFinalize().send({ from: accounts[1] });

        finalized = await rewardContract.methods.finalized().call();
        approved = await rewardContract.methods.isNowApproved().call();

        assert(finalized, "The pool should now be finalized");
        assert(approved, "The poll should be approved.")
    });

    it("The beneficiary of a reward should be able to claim it.", async () => {
        let balanceBefore, poolBalanceBefore, balanceAfter, poolBalanceAfter;

        balanceBefore = await token.balanceOf(accounts[1]);
        poolBalanceBefore = await token.balanceOf(pool.address);

        await rewardContract.methods.withdraw().send({ from: accounts[1] });

        balanceAfter = await token.balanceOf(accounts[1]);
        poolBalanceAfter = await token.balanceOf(pool.address);

        assert(parseInt(balanceAfter) > parseInt(balanceBefore), 'Account balance should be higher than before.');
        assert(parseInt(poolBalanceAfter) < parseInt(poolBalanceBefore), 'Pool balance should be lower than before.');
    });
});
