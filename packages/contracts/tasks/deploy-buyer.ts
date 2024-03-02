import { task, types } from 'hardhat/config';
import promptjs from 'prompt';

task('deploy-buyer', 'Deploys the market buyer utility')
    .addParam('plutocats', 'The address of the plutocats contract', undefined, types.string, false)
    .setAction(async ({ plutocats }, { ethers, network }) => {
        const [deployer] = await ethers.getSigners();
        const bal = await ethers.provider.getBalance(deployer.address);

        console.log('deploy market buyer');
        console.log('deployer', deployer.address, 'plutocats', plutocats);

        promptjs.start();
        const result = await promptjs.get([
            {
                properties: {
                    confirm: {
                        pattern: /^(Y)$/,
                        description:
                            'Type "Y" to confirm deployment.',
                    },
                },
            },
        ]);

        if (result.confirm !== 'Y') {
            console.log(`Exiting...`);
            return;
        }

        let gasPrice = await ethers.provider.getGasPrice();
        const gasInGwei = Math.round(Number(ethers.utils.formatUnits(gasPrice, 'gwei')));

        const gasResult = await promptjs.get([
            {
                properties: {
                    gasPrice: {
                        type: 'integer',
                        required: true,
                        description: 'Enter a gas price (gwei)',
                        default: gasInGwei,
                    },
                },
            },
        ]);
        gasPrice = ethers.utils.parseUnits(gasResult.gasPrice.toString(), 'gwei');

        const marketBuyerFactory = await ethers.getContractFactory('MarketBuyer', deployer);
        const marketBuyerContract = await marketBuyerFactory.deploy(plutocats, {
            gasPrice,
        },);

        await marketBuyerContract.deployed();

        console.log('MarketBuyer deployed to:', marketBuyerContract.address);
    });
