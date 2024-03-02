import ms from "ms";

export const timeAgo = (timestamp: Date, timeOnly?: boolean): string => {
    if (!timestamp) return "never";
    return `${ms(Date.now() - new Date(timestamp).getTime())}${timeOnly ? "" : " ago"
        }`;
};

export function capitalize(str: string) {
    if (!str || typeof str !== "string") return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const truncate = (str: string, length: number) => {
    if (!str || str.length <= length) return str;
    return `${str.slice(0, length)}...`;
};

export const truncateAddress = (address: string, amount: number = 4) => {
    if (address.includes(".")) {
        return address;
    }

    return `${address?.slice(0, amount)}...${address?.slice(
        address.length - amount,
        address.length,
    )}`;
}

export const getBlockTimestamp = (
    currentBlock: number,
    endBlock: number,
) => {
    const blockDif = endBlock - currentBlock;
    const avgTime = 12000;
    const currentTimestamp = Date.now();
    const timestamp = blockDif * avgTime + currentTimestamp;
    return timestamp;
};

export const stateColors = {
    Queued: "text-gray-700",
    Executed: "text-green-500",
    Cancelled: "text-gray-700",
    Defeated: "text-red-500",
    Passed: "text-green-500",
} as { [k: string]: string };

export const supportColors = {
    1: "bg-green-200 text-green-500",
    0: "bg-red-200 text-red-500",
    2: "bg-gray-200",
} as { [k: number]: string };

export const supportColorsText = {
    1: "text-green-500",
    0: "text-red-500",
    2: "text-gray-500",
} as { [k: number]: string };