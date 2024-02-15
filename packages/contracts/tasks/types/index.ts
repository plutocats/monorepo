import { Contract } from 'ethers';

export enum ChainId {
    Mainnet = 1,
    Local = 31337,
}

// prettier-ignore
export type PlutocatsDescriptorContractNames = 'NFTDescriptorV2' | 'PlutocatsDescriptor' | 'SVGRenderer' | 'PlutocatsArt' | 'Inflator';
// prettier-ignore
export type ContractName = PlutocatsDescriptorContractNames | 'PlutocatsSeeder' | 'PlutocatsToken' | 'PlutocatsReserve' | 'MockBlast' | 'PlutocatsReserveProxy' | 'ReserveGovernor';

export interface ContractDeployment {
    args?: (string | number | (() => string))[];
    libraries?: () => Record<string, string>;
    waitForConfirmation?: boolean;
    validateDeployment?: () => void;
}

export interface DeployedContract {
    name: string;
    address: string;
    instance: Contract;
    constructorArguments: (string | number)[];
    libraries: Record<string, string>;
}

export interface ContractRow {
    Address: string;
    'Deployment Hash'?: string;
}