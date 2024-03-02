import { getAllMints } from "@/lib/subgraph";

export const recentMints = () => {
    return getAllMints();
};