import chai from 'chai';
import { ethers, run } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { PlutocatsToken, PlutocatsReserve, ReserveGovernor, PlutocatsDescriptor } from '../../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { time, mine } from "@nomicfoundation/hardhat-network-helpers";

chai.use(solidity);
const { expect } = chai;

describe("ReserveGovernor and Bootstrap process", function () {
    let plutocatsToken: PlutocatsToken;
    let plutocatsReserve: PlutocatsReserve;
    let reserveGovernor: ReserveGovernor;
    let plutocatsDescriptor: PlutocatsDescriptor;
    let wallet: SignerWithAddress;

    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();
        const contracts = await run('deploy', {
            autodeploy: true,
            includepredeploy: true,
            silent: true,
            blastpoints: '0x2fc95838c71e76ec69ff817983BFf17c710F34E0',
            blastpointsoperator: deployer.address
        });

        const tokenFactory = await ethers.getContractFactory('PlutocatsToken', deployer);
        plutocatsToken = tokenFactory.attach(contracts.PlutocatsToken.address);

        const reserveFactory = await ethers.getContractFactory('PlutocatsReserve', deployer);
        plutocatsReserve = reserveFactory.attach(contracts.PlutocatsReserveProxy.address);

        const governorFactory = await ethers.getContractFactory('ReserveGovernor', deployer);
        reserveGovernor = governorFactory.attach(contracts.ReserveGovernor.address);

        const descriptorFactory = await ethers.getContractFactory('PlutocatsDescriptor', {
            libraries: {
                NFTDescriptorV2: contracts.NFTDescriptorV2.address,
            },
            signer: deployer,
        });
        plutocatsDescriptor = descriptorFactory.attach(contracts.PlutocatsDescriptor.address);

        wallet = deployer;

        await run('populate-descriptor', {
            nftDescriptor: contracts.NFTDescriptorV2.address,
            plutocatsDescriptor: contracts.PlutocatsDescriptor.address,
            silent: true,
        });

        // transfer all contracts to the reserve governor
        await plutocatsToken.connect(deployer).transferOwnership(contracts.ReserveGovernor.address);
        await plutocatsDescriptor.connect(deployer).transferOwnership(contracts.ReserveGovernor.address);
    });

    it("All ownable contracts should have the reserve governor set as owner post deploy", async function () {
        const tokenOwner = await plutocatsToken.owner();
        const reserveOwner = await plutocatsReserve.owner();
        const descriptorOwner = await plutocatsDescriptor.owner();
        const governorOwner = await reserveGovernor.owner();

        expect(tokenOwner).to.equal(reserveGovernor.address);
        expect(reserveOwner).to.equal(reserveGovernor.address);
        expect(descriptorOwner).to.equal(reserveGovernor.address);
        expect(governorOwner).to.equal(wallet.address);
    });

    it("Only owner can propose", async function () {
        const [_, s1, s2] = await ethers.getSigners();

        await expect(reserveGovernor.connect(s1).propose(wallet.address)).to.be.reverted;
        await expect(reserveGovernor.connect(wallet).propose(s1.address)).to.not.be.reverted;

        // only one prop per period... should revert
        await expect(reserveGovernor.connect(wallet).propose(s2.address)).to.be.reverted;


        // settle created prop
        const period = await reserveGovernor.proposalPeriod();
        const prop = await reserveGovernor.proposal(s1.address, period);
        await time.increaseTo(prop.endTime.add(10));
        await reserveGovernor.connect(wallet).settleVotes(s1.address);

        await reserveGovernor.connect(wallet).transferOwnership(s1.address);
        await expect(reserveGovernor.connect(s1).propose(wallet.address)).to.not.be.reverted;
        await reserveGovernor.connect(s1).transferOwnership(wallet.address);
    });

    it("Plutocats can vote", async function () {
        const signers = await ethers.getSigners();

        for (let i = 0; i < 5; i++) {
            // mint plutocats for each address
            for (let i = 0; i < 3; i++) {
                const price = await plutocatsToken.getPrice();
                await plutocatsToken.connect(signers[i]).mint({ value: price });
            }
        }

        // propose a new address
        const newOwner = signers[1];
        await reserveGovernor.connect(wallet).propose(newOwner.address);
        const period = await reserveGovernor.proposalPeriod();

        // proposal settings should be correct
        const cts = (await ethers.provider.getBlock('latest')).timestamp;
        const sevendays = ethers.BigNumber.from((cts + (86400 * 7)));
        const eightdays = ethers.BigNumber.from((cts + (86400 * 8)));
        const prop = await reserveGovernor.proposal(newOwner.address, period);
        expect(prop.quorum).to.be.gt(0);
        expect(prop.endTime).to.be.gte(sevendays);
        expect(prop.endTime).to.be.lt(eightdays);

        // allow voting
        for (let i = 0; i < 5; i++) {
            await reserveGovernor.connect(signers[i]).vote(newOwner.address, 1);
        }

        // settle the vote and ensure all ownership transfered
        await time.increaseTo(prop.endTime.add(10));
        await reserveGovernor.settleVotes(newOwner.address);

        // ensure that governance is forever locked
        await expect(reserveGovernor.propose(signers[0].address)).to.be.revertedWith("GovernanceLocked()");
    });

    it("Proposal quorum is properly calculated", async function () {
        const signers = await ethers.getSigners();

        // 50 mints at 10% quorum = 5 expected votes
        for (let i = 0; i < 5; i++) {
            // mint plutocats for each address
            for (let i = 0; i < 10; i++) {
                const price = await plutocatsToken.getPrice();
                await plutocatsToken.connect(signers[i]).mint({ value: price });
            }
        }


        // propose a new address
        const newOwner = signers[1];
        await reserveGovernor.connect(wallet).propose(newOwner.address);
        const period = await reserveGovernor.proposalPeriod();

        // proposal settings should be correct
        const prop = await reserveGovernor.proposal(newOwner.address, period);
        expect(prop.quorum).to.be.eq(ethers.BigNumber.from("5"));
    });

    it('Can repropose if failed and ownership is transferred after settlement', async function () {
        const signers = await ethers.getSigners();

        for (let i = 0; i < 5; i++) {
            // mint plutocats for each address
            for (let i = 0; i < 3; i++) {
                const price = await plutocatsToken.getPrice();
                await plutocatsToken.connect(signers[i]).mint({ value: price });
            }
        }

        // propose a new address
        const newOwner = signers[1];
        await reserveGovernor.connect(wallet).propose(newOwner.address);
        let period = await reserveGovernor.proposalPeriod();

        // proposal settings should be correct
        const cts = (await ethers.provider.getBlock('latest')).timestamp;
        const sevendays = ethers.BigNumber.from((cts + (86400 * 7)));
        const eightdays = ethers.BigNumber.from((cts + (86400 * 8)));

        let prop = await reserveGovernor.proposal(newOwner.address, period);
        expect(prop.quorum).to.be.gt(0);
        expect(prop.endTime).to.be.gte(sevendays);
        expect(prop.endTime).to.be.lt(eightdays);

        // zero weight votes don't count
        await reserveGovernor.connect(signers[6]).vote(newOwner.address, 1);
        prop = await reserveGovernor.proposal(newOwner.address, period);
        expect(prop.forVotes).to.be.eq(0);

        // allow voting
        for (let i = 0; i < 5; i++) {
            await reserveGovernor.connect(signers[i]).vote(newOwner.address, 0);
        }

        // settle the vote no ownership transfered
        await time.increaseTo(prop.endTime.add(10));
        await reserveGovernor.settleVotes(newOwner.address);

        /// it should allow reproposing a new prop on failure
        await reserveGovernor.connect(wallet).propose(newOwner.address);
        period = await reserveGovernor.proposalPeriod();
        prop = await reserveGovernor.proposal(newOwner.address, period);
        await time.increaseTo(prop.endTime.add(1000));
        await expect(reserveGovernor.settleVotes(newOwner.address)).to.not.be.reverted;


        await reserveGovernor.connect(wallet).propose(newOwner.address);
        prop = await reserveGovernor.proposal(newOwner.address, period.add(1));
        for (let i = 0; i < 5; i++) {
            await reserveGovernor.connect(signers[i]).vote(newOwner.address, 1);
        }

        await time.increaseTo(prop.endTime.add(10));
        await reserveGovernor.settleVotes(newOwner.address);

        // prop is passed. governance is locked and all ownership of contracts transferred
        const govLocked = await reserveGovernor.governanceLocked();
        expect(govLocked).to.be.true;

        const dOwner = await plutocatsDescriptor.owner();
        expect(dOwner).to.be.eq(newOwner.address);
        const tOwner = await plutocatsToken.owner();
        expect(tOwner).to.be.eq(newOwner.address);
        const rOwner = await plutocatsReserve.owner();
        expect(rOwner).to.be.eq(newOwner.address);

        // new owner can transfer ownership
        expect(plutocatsReserve.connect(newOwner).transferOwnership(signers[0].address)).to.not.be.reverted;
        expect(plutocatsToken.connect(newOwner).transferOwnership(signers[0].address)).to.not.be.reverted;
        expect(plutocatsDescriptor.connect(newOwner).transferOwnership(signers[0].address)).to.not.be.reverted;
    });

    it('Vote snapshot is taken', async function () {
        const signers = await ethers.getSigners();

        for (let i = 0; i < 5; i++) {
            // mint 3 plutocats for each address
            for (let j = 0; j < 3; j++) {
                const price = await plutocatsToken.getPrice();
                await plutocatsToken.connect(signers[i]).mint({ value: price });
            }
        }

        // propose a new address
        const newOwner = signers[1];
        await reserveGovernor.connect(wallet).propose(newOwner.address);
        const period = await reserveGovernor.proposalPeriod();

        await expect(reserveGovernor.connect(signers[1]).vote(newOwner.address, 1)).to.not.be.reverted;
        let prop = await reserveGovernor.proposal(newOwner.address, period);
        expect(prop.forVotes).to.be.eq(3);

        /// Voting reverts if on a invalid address
        await expect(reserveGovernor.connect(signers[1]).vote(plutocatsToken.address, 1)).to.be.revertedWith("InvalidProposal()");

        /// Cannot vote twice
        await expect(reserveGovernor.connect(signers[1]).vote(newOwner.address, 1)).to.be.revertedWith("HasVoted()");

        await mine(30);

        // mint 3 more tokens after proposal created
        for (let i = 0; i < 3; i++) {
            const price = await plutocatsToken.getPrice();
            await plutocatsToken.connect(signers[2]).mint({ value: price });
        }

        await expect(reserveGovernor.connect(signers[2]).vote(newOwner.address, 1)).to.not.be.reverted;
        prop = await reserveGovernor.proposal(newOwner.address, period);

        // total voting for 2 people should be 6
        expect(prop.forVotes).to.be.eq(6);
    });
});