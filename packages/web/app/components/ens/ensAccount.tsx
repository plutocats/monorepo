// @ts-nocheck
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { truncateAddress } from "../../../lib/utils";
import { PublicClient } from "viem";

// cache ens names in local storage
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { explorerBaseURL } from "@/config";

type ENSStoreData = {
  name: string;
  lastUpdated: Date;
};

type ENSStoreState = {
  addressBook: Record<string, ENSStoreData>;
};

const useENSStore = create<ENSStoreState>(
  persist(
    () => ({
      addressBook: {},
    }),
    { name: "ens-address-book" }
  )
);

type Props = {
  address: string;
  ensName?: string;
  includeLink?: boolean;
  hideAvatar?: boolean;
  client: PublicClient;
  turbo?: boolean;
};

function ENSAccount(props: Props) {
  const addr = props.address;
  const ensName = useENSStore((state: any) => (addr ? state.addressBook[addr] || addr : null));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fn = async () => {
      // only attempt to update the names every 7 days
      if (ensName.lastUpdated) {
        const now = new Date();
        const plusDay = new Date(new Date(ensName.lastUpdated).getTime() + 7 * 86400000);

        if (now < plusDay) return;
      }

      try {
        const name = await props.client.getEnsName({ address: addr as `0x${string}` });
        useENSStore.setState((state: any) => ({
          addressBook: {
            ...state.addressBook,
            [addr]: { name, lastUpdated: new Date() },
          },
        }));
      } catch (e) {}
    };

    fn();
  }, [props.address]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <a className="w-full items-center flex" href={`${explorerBaseURL}address/${props.address}`} target="_blank">
      <span className="w-full overflow-hidden overflow-ellipsis text-blue-500 hover:underline">
        {loaded ? (ensName?.name ? ensName.name : truncateAddress(props.address, 4)) : ""}
      </span>
      {props.turbo ? <span className="self-end inline-block no-underline mx-2">⚡️</span> : null}
      <span className="self-end inline-block no-underline">
        <span className="relative" style={{ top: "2px" }}>
          ↗
        </span>
      </span>
    </a>
  );
}

export default ENSAccount;
