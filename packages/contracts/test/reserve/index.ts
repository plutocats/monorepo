import chai from 'chai';
import { ethers, run } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { PlutocatsToken, PlutocatsReserve } from '../../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(solidity);
const { expect } = chai;

describe("Reserve contract", function () {
    let plutocatsToken: PlutocatsToken;
    let plutocatsReserve: PlutocatsReserve;
    let wallet: SignerWithAddress;

    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();
        const contracts = await run('deploy', { autodeploy: true, includepredeploy: true, silent: true });

        const tokenFactory = await ethers.getContractFactory('PlutocatsToken', deployer);
        plutocatsToken = tokenFactory.attach(contracts.PlutocatsToken.address);

        const reserveFactory = await ethers.getContractFactory('PlutocatsReserve', deployer);
        plutocatsReserve = reserveFactory.attach(contracts.PlutocatsReserveProxy.address);

        wallet = deployer;

        await run('populate-descriptor', {
            nftDescriptor: contracts.NFTDescriptorV2.address,
            plutocatsDescriptor: contracts.PlutocatsDescriptor.address,
            silent: true,
        });
    });

    it("It should only allow quits if token approval is set first", async function () {
        const price = await plutocatsToken.getPrice();
        await plutocatsToken.mint({ value: price });

        await expect(plutocatsReserve.quit([0])).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");

        // approve and quit should work
        await plutocatsToken.approve(plutocatsReserve.address, 0);
        await expect(plutocatsReserve.quit([0])).to.not.be.reverted;
    });

    it("It should fail if sender does not own the tokens provided", async function () {
        for (let i = 0; i < 3; i++) {
            const price = await plutocatsToken.getPrice();
            await plutocatsToken.mint({ value: price });
        }

        await plutocatsToken.transferFrom(wallet.address, "0x000000000000000000000000000000000000dEaD", 0);

        // 0 is not owned by the sender should revert
        await expect(plutocatsReserve.quit([0, 1, 2])).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");

        // approve and quit on owned tokens should work
        await plutocatsToken.setApprovalForAll(plutocatsReserve.address, true);
        await expect(plutocatsReserve.quit([1, 2])).to.not.be.reverted;
    });

    it("It should revert if duplicate tokenIds are passed in burn", async function () {
        const price = await plutocatsToken.getPrice();
        await plutocatsToken.mint({ value: price });

        await expect(plutocatsReserve.quit([0])).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");

        // approve and quit should work
        await plutocatsToken.approve(plutocatsReserve.address, 0);

        // owner does not own token after quit (the reserve does, so duplicate ids passed should always revert)
        await expect(plutocatsReserve.quit([0, 0, 0])).to.be.revertedWith("ERC721: transfer of token that is not own");
    });

    it("It should allow claiming yield by anyone since by default it is sent to the reserve and reverts i contract has a governor configured", async function () {
        const [_, s1] = await ethers.getSigners();
        await expect(plutocatsReserve.connect(s1).claimAllYield()).to.not.be.reverted;
    });

    it("Only owner can set blast governor", async function () {
        const [_, s1] = await ethers.getSigners();
        await expect(plutocatsReserve.connect(s1).setGovernor(ethers.constants.AddressZero)).to.be.reverted;
    });

    it("It should calc pro rata claim correctly using adjusted supply", async function () {
        const [_, s1, s2] = await ethers.getSigners();

        let catsTokenS1 = plutocatsToken.connect(s1);
        let catsTokenS2 = plutocatsToken.connect(s2);
        let s1Ids = [];
        let s2Ids = [];
        let s1Contrib = [];
        let s2Contrib = [];

        for (let i = 0; i < 5; i++) {
            // have buyers chase each other
            let price = await catsTokenS1.getPrice();
            const s1id = await catsTokenS1.callStatic.mint({ value: price });
            s1Ids.push(s1id);
            s1Contrib.push(price);

            await catsTokenS1.mint({ value: price });

            price = await catsTokenS2.getPrice();
            const s2id = await catsTokenS2.callStatic.mint({ value: price });
            s2Ids.push(s2id);
            s2Contrib.push(price);

            await catsTokenS2.mint({ value: price });
        }

        await catsTokenS1.setApprovalForAll(plutocatsReserve.address, true);
        await catsTokenS2.setApprovalForAll(plutocatsReserve.address, true);

        // we now have 10 tokens minted by 2 different buyers
        // if we unroll the reserve in reverse order to which tokens
        // were minted, callers should receive back equal amounts
        let rS1 = plutocatsReserve.connect(s1);
        let rS2 = plutocatsReserve.connect(s2);

        let s1Received = ethers.BigNumber.from(0);
        let s2Received = ethers.BigNumber.from(0);
        for (let i = 4; i >= 0; i--) {
            let tx = await rS2.quit([s2Ids[i]]);
            let receipt = await tx.wait();
            let e = receipt.events?.filter((x) => { return x.event == "Quit"; })[0];

            // @ts-ignore
            s2Received = s2Received.add(e?.args.amount);

            tx = await rS1.quit([s1Ids[i]]);
            receipt = await tx.wait();
            e = receipt.events?.filter((x) => { return x.event == "Quit"; })[0];

            // @ts-ignore
            s1Received = s1Received.add(e?.args.amount);
        }

        expect(s1Received).to.be.closeTo(s2Received, s1Received.div(ethers.BigNumber.from("1000000000000000000")));

        const reserveBalance = await ethers.provider.getBalance(plutocatsReserve.address);
        await expect(reserveBalance).to.be.eq(0);

        for (let i = 0; i < 5; i++) {
            // have buyers chase each other
            let price = await catsTokenS1.getPrice();
            const s1id = await catsTokenS1.callStatic.mint({ value: price });
            s1Ids.push(s1id);
            s1Contrib.push(price);

            await catsTokenS1.mint({ value: price });

            price = await catsTokenS2.getPrice();
            const s2id = await catsTokenS2.callStatic.mint({ value: price });
            s2Ids.push(s2id);
            s2Contrib.push(price);

            await catsTokenS2.mint({ value: price });
        }
    });
});