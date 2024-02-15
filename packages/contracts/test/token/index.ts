import chai from 'chai';
import { ethers, run } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { PlutocatsToken, PlutocatsReserve } from '../../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { time } from "@nomicfoundation/hardhat-network-helpers";


chai.use(solidity);
const { expect } = chai;
const ONE_HUNDRED_DAYS = 60 * 60 * 24 * 100;

describe("Token contract", function () {
    let plutocatsToken: PlutocatsToken;
    let plutocatsReserve: PlutocatsReserve;
    let wallet: SignerWithAddress;

    beforeEach(async function () {
        const [deployer] = await ethers.getSigners();
        const contracts = await run('deploy', { autodeploy: true, includepredeploy: true, silent: false });

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

    it("It should mint and render a proper tokenURI", async function () {
        const price = await plutocatsToken.getPrice();
        await plutocatsToken.mint({ value: price });
        await plutocatsToken.tokenURI(0, { gasLimit: 3000000000 });
    });

    it("It should have a dynamic min price set to reserve book value", async function () {
        for (let i = 0; i < 10; i++) {
            const price = await plutocatsToken.getPrice();
            await plutocatsToken.mint({ value: price });
        }

        // warp 100 days in the future to kick on dynamic reserve price
        await time.increase(ONE_HUNDRED_DAYS);

        const totalSupply = await plutocatsToken.adjustedTotalSupply();
        const reserveBalance = await ethers.provider.getBalance(plutocatsReserve.address);
        const bookValue = reserveBalance.div(totalSupply);
        const minPrice = await plutocatsToken.getPrice();

        expect(minPrice).to.eq(bookValue);
    });

    it("It should have its owner is properly set on deployment", async function () {
        const owner = await plutocatsToken.owner();
        expect(owner).to.eq(wallet.address);
    });

    it('It should record contributions', async function () {
        let totalComps = ethers.BigNumber.from(0);

        for (let i = 0; i < 3; i++) {
            const price = await plutocatsToken.getPrice();
            await plutocatsToken.mint({ value: price });
            totalComps = totalComps.add(price);
        }

        let balance = await plutocatsToken.balanceOf(wallet.address);
        let tokenIds: any[] = [];
        for (let i = 0; i < balance.toNumber(); i++) {
            const tokenId = await plutocatsToken.tokenOfOwnerByIndex(wallet.address, i);
            tokenIds.push(tokenId);
        }

        let totalCompsOnchain = ethers.BigNumber.from(0);
        for (let i = 0; i < tokenIds.length; i++) {
            const contribution = await plutocatsToken.contributionsOf(tokenIds[i]);
            totalCompsOnchain = totalCompsOnchain.add(contribution.amount);
        }

        expect(totalComps).to.eq(totalCompsOnchain);
    });

    it('It should ignore tokens held by the reserve when calculating adjusted total supply', async function () {
        const tokenIds = [];
        for (let i = 0; i < 10; i++) {
            const price = await plutocatsToken.getPrice();
            const tokenId = await plutocatsToken.callStatic.mint({ value: price });
            await plutocatsToken.mint({ value: price });
            tokenIds.push(tokenId);
        }

        // transfer all but one to the reserve
        for (let i = 1; i < tokenIds.length; i++) {
            const tId = tokenIds[i];
            await plutocatsToken.transferFrom(wallet.address, plutocatsReserve.address, tId);
        }

        const adjT = await plutocatsToken.adjustedTotalSupply();
        expect(adjT).to.be.eq(1);
    });

    it('It should ensure management functions are only callable by owner', async function () {
        const [_, s1] = await ethers.getSigners();
        const ownableErr = "Ownable: caller is not the owner";
        await expect(plutocatsToken.connect(s1).setReservePrice(false)).to.be.revertedWith(ownableErr);
        await expect(plutocatsToken.connect(s1).setSeeder(s1.address)).to.be.revertedWith(ownableErr);
        await expect(plutocatsToken.connect(s1).setDescriptor(s1.address)).to.be.revertedWith(ownableErr);
        await expect(plutocatsToken.connect(s1).setContractURIHash("wiz")).to.be.revertedWith(ownableErr);

        // do it with owner
        await expect(plutocatsToken.setReservePrice(false)).to.not.be.reverted;
        await expect(plutocatsToken.setSeeder(s1.address)).to.not.be.reverted;
        await expect(plutocatsToken.setDescriptor(s1.address)).to.not.be.reverted;
        await expect(plutocatsToken.setContractURIHash("was-here")).to.not.be.reverted;
    });
});