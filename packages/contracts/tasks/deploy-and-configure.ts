import { ContractDeployment, ContractName, DeployedContract } from './types';
import { task, types } from 'hardhat/config';
import { printContractsTable } from './utils';

task('deploy-and-configure', 'Deploy and configure all contracts')
    .addFlag('autodeploy', 'Deploy all contracts without user interaction')
    .setAction(async (args, { run, ethers }) => {
        const [deployer] = await ethers.getSigners();
        const bal = await ethers.provider.getBalance(deployer.address);
        console.log('deployer', deployer.address, bal);

        // Deploy the Nouns DAO contracts and return deployment information
        const contracts: Record<ContractName, DeployedContract> = await run('deploy', args);
        printContractsTable(contracts);

        // Populate the on-chain art
        await run('populate-descriptor', {
            nftDescriptor: contracts.NFTDescriptorV2.address,
            plutocatsDescriptor: contracts.PlutocatsDescriptor.address,
        });

        await contracts.PlutocatsToken.instance.transferOwnership(contracts.ReserveGovernor.address);
        await contracts.PlutocatsDescriptor.instance.transferOwnership(contracts.ReserveGovernor.address);

        // Verify the contracts on Etherscan
        console.log('verify contracts');
        await run('verify-etherscan', {
            contracts,
        });

        console.log('Deployment Complete.');
    });