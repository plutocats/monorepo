import { ContractDeployment, ContractName, DeployedContract } from './types';
import { task, types } from 'hardhat/config';
import { printContractsTable } from './utils';
import promptjs from 'prompt';
import fs from 'fs';

promptjs.colors = false;
promptjs.message = '> ';
promptjs.delimiter = '';

task('deploy-and-configure', 'Deploy and configure all contracts')
    .addFlag('autodeploy', 'Deploy all contracts without user interaction')
    .addFlag('local', 'Deploy to a local network')
    .addFlag('staging', 'Deploy to blast testnet sepolia')
    .setAction(async (args, { run, ethers }) => {
        const [deployer, pointsOperator] = await ethers.getSigners();
        const bal = await ethers.provider.getBalance(deployer.address);

        console.log('deployer', deployer.address, bal);
        console.log('pointsOperator', pointsOperator.address);

        if (args.local) {
            args = {
                autodeploy: false,
                includepredeploy: true,
                silent: false,
                blastpoints: '0x2fc95838c71e76ec69ff817983BFf17c710F34E0',
                blastpointsoperator: pointsOperator.address,
                local: true,
            };

            console.log('\nlocal deployment \n%j\n', args);
        } else if (args.staging) {
            args = {
                autodeploy: false,
                silent: false,
                blastpoints: '0x2fc95838c71e76ec69ff817983BFf17c710F34E0',
                blastpointsoperator: pointsOperator.address,
            };

            console.log('\nstaging deployment \n%j\n', args);
        } else {
            args = {
                autodeploy: false,
                silent: false,
                blastpoints: '0x2536FE9ab3F511540F2f9e2eC2A805005C3Dd800',
                blastpointsoperator: pointsOperator.address,
            };

            console.log('\nmainnet deployment \n%j\n', args);
        }

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

        if (!args.local) {
            const result = await promptjs.get([
                {
                    properties: {
                        confirm: {
                            pattern: /^(Y)$/,
                            description:
                                'Type "Y" verify contracts.',
                        },
                    },
                },
            ]);

            if (result.confirm !== 'Y') {
                console.log(`Exiting...`);
                return;
            }

            // Verify the contracts on Etherscan
            console.log('verify contracts');

            // fs.writeFileSync('./contracts.json', JSON.stringify({ contracts }, null, 2), 'utf-8');
            await run('verify-etherscan', {
                contracts,
            });
        }

        console.log('Deployment Complete.');
    });