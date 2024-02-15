import { task, types } from 'hardhat/config';
import ImageData from '../../art/src/image-data.json';
import { dataToDescriptorInput } from './utils';
import { constants } from "ethers";

task('populate-descriptor', 'Populates the descriptor with color palettes and Plutocats parts')
    .addParam(
        'nftDescriptor',
        'The `NFTDescriptorV2` contract address',
    )
    .addParam(
        'plutocatsDescriptor',
        'The `PlutocatsDescriptor` contract address',
    )
    .addOptionalParam(
        'silent',
        'Disable logging',
        false,
        types.boolean,
    )
    .setAction(async ({ nftDescriptor, plutocatsDescriptor, silent }, { ethers, network }) => {
        const options = { gasLimit: network.name === 'anvil' ? 3000000000 : undefined };

        const descriptorFactory = await ethers.getContractFactory('PlutocatsDescriptor', {
            libraries: {
                NFTDescriptorV2: nftDescriptor,
            },
        });
        const descriptorContract = descriptorFactory.attach(plutocatsDescriptor);

        const { bgcolors, palette, images } = ImageData;
        const { bodies, accessories, heads, eyes, glasses } = images;

        const bodiesPage = dataToDescriptorInput(bodies.map(({ data }) => data));
        const headsPage = dataToDescriptorInput(heads.map(({ data }) => data));
        const eyesPage = dataToDescriptorInput(eyes.map(({ data }) => data));
        const glassesPage = dataToDescriptorInput(glasses.map(({ data }) => data));
        const accessoriesPage = dataToDescriptorInput(accessories.map(({ data }) => data));

        await descriptorContract.addManyBackgrounds(bgcolors);
        await descriptorContract.setPalette(0, `0x000000${palette.join('')}`);

        await descriptorContract.addBodies(
            bodiesPage.encodedCompressed,
            bodiesPage.originalLength,
            bodiesPage.itemCount,
            options,
        );

        await descriptorContract.addHeads(
            headsPage.encodedCompressed,
            headsPage.originalLength,
            headsPage.itemCount,
            options,
        );

        await descriptorContract.addEyes(
            eyesPage.encodedCompressed,
            eyesPage.originalLength,
            eyesPage.itemCount,
            options,
        );

        await descriptorContract.addGlasses(
            glassesPage.encodedCompressed,
            glassesPage.originalLength,
            glassesPage.itemCount,
            options,
        );

        await descriptorContract.addAccessories(
            accessoriesPage.encodedCompressed,
            accessoriesPage.originalLength,
            accessoriesPage.itemCount,
            options,
        );

        if (!silent) {
            console.log('Descriptor populated with palettes and parts.');
        }
    });
