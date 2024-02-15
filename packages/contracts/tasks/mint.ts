import { task } from 'hardhat/config';

task('mint', 'Mints a plutocat on Blast sepolia')
    .setAction(async ({ }, { ethers, network }) => {
        const [deployer] = await ethers.getSigners();
        const tokenFactory = await ethers.getContractFactory('PlutocatsToken', deployer);
        const plutocatsToken = tokenFactory.attach("0xC0806F8884BE6e67b38dCfe21C5db1eB620ee633");
        const price = await plutocatsToken.getPrice();
        console.log('mint price', price, deployer.address);

        try {
            await plutocatsToken.mint({ value: price });
            console.log('minted cat');
        } catch (e) {
            console.log(e);
        }
    });
