import { ContractDeployment, ContractName, DeployedContract } from './types';
import { task, types } from 'hardhat/config';
import promptjs from 'prompt';
import { printContractsTable } from './utils';

promptjs.colors = false;
promptjs.message = '> ';
promptjs.delimiter = '';

// get the encoded data for UUPS proxy initilization.
function getInitializerData(contractInterface: any, args: any) {
    const initializer = 'initialize';
    const fragment = contractInterface.getFunction(initializer);
    return contractInterface.encodeFunctionData(fragment, args);
}

task('deploy', 'Deploys NFTDescriptor, PlutocatsDescriptor, PlutocatsSeeder, and PlutocatsToken')
    .addFlag('autodeploy', 'Deploy all contracts without user interaction')
    .addFlag('includepredeploy', 'Include blast predeploy')
    .addParam('blastpoints', 'The address of the blast points contract', undefined, types.string, false)
    .addParam('blastpointsoperator', 'The address of the blast points operator', undefined, types.string, false)
    .addOptionalParam(
        'mintStart',
        'The time to enable minting. Defaults to the current time.',
        undefined,
        types.int,
    )
    .addOptionalParam(
        'silent',
        'Disable logging',
        false,
        types.boolean,
    )
    .setAction(async ({ autodeploy, includepredeploy, mintStart, silent, blastpoints, blastpointsoperator }, { ethers }) => {
        if (!silent) {
            console.log(`
        
        ===deploy script===\n<includepredeploy>: ${includepredeploy}\nbp: ${blastpoints}\nbpo: ${blastpointsoperator}
        
        `);
        }

        const PLUTOCATS_ART_NONCE_OFFSET = includepredeploy ? 5 : 4;
        const PLUTOCATS_RESERVE_NONCE_OFFSET = includepredeploy ? 9 : 8;
        const PLUTOCATS_RESERVE_GOVERNOR_NONCE_OFFSET = includepredeploy ? 10 : 9;

        const [deployer] = await ethers.getSigners();

        const nonce = await deployer.getTransactionCount();
        const expectedPlutocatsArtAddress = ethers.utils.getContractAddress({
            from: deployer.address,
            nonce: nonce + PLUTOCATS_ART_NONCE_OFFSET,
        });

        const expectedPlutocatsReserveAddress = ethers.utils.getContractAddress({
            from: deployer.address,
            nonce: nonce + PLUTOCATS_RESERVE_NONCE_OFFSET,
        });


        const expectedReserveGovernorAddress = ethers.utils.getContractAddress({
            from: deployer.address,
            nonce: nonce + PLUTOCATS_RESERVE_GOVERNOR_NONCE_OFFSET,
        });

        const deployment: Record<ContractName, DeployedContract> = {} as Record<
            ContractName,
            DeployedContract
        >;

        // if a mint time isn't define use the current timestamp
        let startMintingAt = mintStart;
        if (startMintingAt === undefined) {
            startMintingAt = (await ethers.provider.getBlock('latest')).timestamp;
        }

        const contracts: Record<ContractName, ContractDeployment> = {
            MockBlast: {
                waitForConfirmation: true,
            },
            NFTDescriptorV2: {},
            SVGRenderer: {},
            PlutocatsDescriptor: {
                waitForConfirmation: true,
                args: [expectedPlutocatsArtAddress, () => deployment.SVGRenderer.address],
                libraries: () => ({
                    NFTDescriptorV2: deployment.NFTDescriptorV2.address,
                }),
            },
            Inflator: {},
            PlutocatsArt: {
                args: [() => deployment.PlutocatsDescriptor.address, () => deployment.Inflator.address],
            },
            PlutocatsSeeder: {},
            PlutocatsToken: {
                waitForConfirmation: true,
                args: [
                    startMintingAt,
                    expectedPlutocatsReserveAddress,
                    () => deployment.PlutocatsDescriptor.address,
                    () => deployment.PlutocatsSeeder.address,
                    true,
                    () => {
                        return includepredeploy ? deployment.MockBlast.address : ethers.constants.AddressZero;
                    },
                ],
            },
            PlutocatsReserve: {
                waitForConfirmation: true,
            },
            /// proxy for reserve
            PlutocatsReserveProxy: {
                waitForConfirmation: true,
                args: [
                    () => deployment.PlutocatsReserve.address,
                    () => getInitializerData(
                        deployment.PlutocatsReserve.instance.interface,
                        [
                            deployment.PlutocatsToken.address,
                            expectedReserveGovernorAddress,
                            includepredeploy ? deployment.MockBlast.address : ethers.constants.AddressZero,
                            blastpoints,
                            blastpointsoperator, // blast points operator
                        ]
                    )
                ],
            },
            ReserveGovernor: {
                waitForConfirmation: true,
                // 5% quorum default
                args: [() => deployment.PlutocatsToken.address, () => deployment.PlutocatsDescriptor.address, () => deployment.PlutocatsReserveProxy.address, 1000],
            },

        };

        for (const [name, contract] of Object.entries(contracts)) {
            if (name === 'MockBlast' && !includepredeploy) continue;

            let gasPrice = await ethers.provider.getGasPrice();
            if (!autodeploy) {
                const gasInGwei = Math.round(Number(ethers.utils.formatUnits(gasPrice, 'gwei')));

                promptjs.start();

                const result = await promptjs.get([
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
                gasPrice = ethers.utils.parseUnits(result.gasPrice.toString(), 'gwei');
            }

            const factory = await ethers.getContractFactory(name, {
                libraries: contract?.libraries?.(),
            });

            const deploymentGas = await factory.signer.estimateGas(
                factory.getDeployTransaction(
                    ...(contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? []),
                    {
                        gasPrice,
                    },
                ),
            );

            const deploymentCost = deploymentGas.mul(gasPrice);

            if (!silent) {
                console.log(
                    `Estimated cost to deploy ${name}: ${ethers.utils.formatUnits(
                        deploymentCost,
                        'ether',
                    )} ETH`,
                );
            }

            if (!autodeploy) {
                const result = await promptjs.get([
                    {
                        properties: {
                            confirm: {
                                pattern: /^(DEPLOY|SKIP|EXIT)$/,
                                description:
                                    'Type "DEPLOY" to confirm, "SKIP" to skip this contract, or "EXIT" to exit.',
                            },
                        },
                    },
                ]);

                if (result.confirm === 'SKIP') {
                    console.log(`Skipping ${name} deployment...`);
                    continue;
                }
                if (result.confirm === 'EXIT') {
                    console.log('Exiting...');
                    return;
                }
            }

            if (!silent) {
                console.log(`Deploying ${name}...`);
            }

            const deployedContract = await factory.deploy(
                ...(contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? []),
                {
                    gasPrice,
                },
            );

            if (contract.waitForConfirmation) {
                await deployedContract.deployed();
            }

            deployment[name as ContractName] = {
                name,
                instance: deployedContract,
                address: deployedContract.address,
                constructorArguments: contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? [],
                libraries: contract?.libraries?.() ?? {},
            };

            contract.validateDeployment?.();

            if (!silent) {
                console.log(`${name} contract deployed to ${deployedContract.address}`);
            }
        }

        if (!silent) {
            printContractsTable(deployment);
        }

        return deployment;
    });